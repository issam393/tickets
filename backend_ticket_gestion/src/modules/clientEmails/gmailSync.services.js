const { ImapFlow } = require('imapflow');
const { simpleParser } = require('mailparser');
const clientEmailService = require('./clientEmails.services');

const DEFAULT_GMAIL_INBOX = 'ouladsmaneissam@gmail.com';
const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024;
const SYNC_DAYS = 30;
const MAX_MESSAGES_PER_SYNC = 100;
const DEFAULT_SYNC_INTERVAL_MS = 60 * 1000;
const MIN_SYNC_INTERVAL_MS = 15 * 1000;
const FALLBACK_EMAIL_CONTENT = 'This email did not include a text message.';
let synchronizationPromise = null;
let automaticSyncTimer = null;

function getConfiguration() {
    const user = String(process.env.GMAIL_IMAP_USER || DEFAULT_GMAIL_INBOX).trim();
    const password = String(process.env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, '');
    if (!password) {
        throw new Error('Gmail sync is not configured. Add GMAIL_APP_PASSWORD to the backend environment.');
    }
    return { user, password };
}

function buildAttachmentPayload(attachment) {
    if (!attachment.content || attachment.content.length > MAX_ATTACHMENT_SIZE) return null;
    const contentType = attachment.contentType || 'application/octet-stream';
    return {
        fileName: attachment.filename || 'attachment',
        mimeType: contentType,
        sizeBytes: attachment.size || attachment.content.length,
        fileUrl: `data:${contentType};base64,${attachment.content.toString('base64')}`
    };
}

function normalizeParsedContent(parsed) {
    const plainText = String(parsed.text || '').trim();
    if (plainText) {
        return plainText;
    }

    const html = typeof parsed.html === 'string' ? parsed.html : '';
    const htmlText = html
        .replace(/<style[\s\S]*?<\/style>/gi, ' ')
        .replace(/<script[\s\S]*?<\/script>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    return htmlText || FALLBACK_EMAIL_CONTENT;
}

async function importGmailInbox() {
    const configuration = getConfiguration();
    const client = new ImapFlow({
        host: 'imap.gmail.com',
        port: 993,
        secure: true,
        auth: {
            user: configuration.user,
            pass: configuration.password
        },
        logger: false
    });
    let connectionError = null;

    // IMAP connections may be reset by Gmail or the network. Handle the event so
    // a mail synchronization failure cannot terminate the whole API process.
    client.on('error', (error) => {
        connectionError = error;
    });

    const result = { imported: 0, ignoredUnknownSender: 0, skippedDuplicates: 0, skippedInvalid: 0 };
    try {
        await client.connect();
        const lock = await client.getMailboxLock('INBOX');
        try {
            const since = new Date(Date.now() - SYNC_DAYS * 24 * 60 * 60 * 1000);
            const uids = await client.search({ since }, { uid: true });
            const latestUids = uids.slice(-MAX_MESSAGES_PER_SYNC);
            for await (const message of client.fetch(latestUids, { source: true, internalDate: true }, { uid: true })) {
                const parsed = await simpleParser(message.source);
                const senderEmail = String(parsed.from?.value?.[0]?.address || '').trim().toLowerCase();
                if (!senderEmail) {
                    result.skippedInvalid += 1;
                    continue;
                }

                const sourceMessageId = String(parsed.messageId || `gmail:${configuration.user}:${message.uid}`);
                const attachments = parsed.attachments
                    .map(buildAttachmentPayload)
                    .filter(Boolean);
                try {
                    const imported = await clientEmailService.receiveEmail({
                        senderEmail,
                        sourceMessageId,
                        subject: String(parsed.subject || '').trim() || '(No subject)',
                        content: normalizeParsedContent(parsed),
                        receivedAt: parsed.date || message.internalDate || new Date(),
                        attachments
                    });
                    if (imported) result.imported += 1;
                    else result.skippedDuplicates += 1;
                } catch (error) {
                    if (error.message.includes('existing client')) {
                        result.ignoredUnknownSender += 1;
                        continue;
                    }
                    if (error.message === 'senderEmail is required' || error.message === 'Invalid email format') {
                        result.skippedInvalid += 1;
                        continue;
                    }
                    throw error;
                }
            }
        } finally {
            lock.release();
        }
    } finally {
        await client.logout().catch(() => {});
    }

    if (connectionError) {
        throw connectionError;
    }

    return result;
}

async function syncGmailInbox() {
    if (synchronizationPromise) {
        return synchronizationPromise;
    }

    synchronizationPromise = importGmailInbox();
    try {
        return await synchronizationPromise;
    } finally {
        synchronizationPromise = null;
    }
}

function getAutomaticSyncInterval() {
    const configuredInterval = Number(process.env.GMAIL_SYNC_INTERVAL_MS);
    return Number.isFinite(configuredInterval) && configuredInterval >= MIN_SYNC_INTERVAL_MS
        ? configuredInterval
        : DEFAULT_SYNC_INTERVAL_MS;
}

function startAutomaticGmailSync() {
    if (automaticSyncTimer || !String(process.env.GMAIL_APP_PASSWORD || '').trim()) {
        return;
    }

    const runAutomaticSync = () => {
        syncGmailInbox().catch((error) => {
            console.error('Automatic Gmail synchronization failed:', error.message);
        });
    };

    runAutomaticSync();
    automaticSyncTimer = setInterval(runAutomaticSync, getAutomaticSyncInterval());
    automaticSyncTimer.unref();
}

module.exports = {
    syncGmailInbox,
    startAutomaticGmailSync
};

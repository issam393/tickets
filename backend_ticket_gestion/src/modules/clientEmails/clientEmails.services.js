const clientEmailRepository = require('./clientEmails.repository');

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_ATTACHMENT_URI = /^(https?:\/\/|\/|data:)/i;
const SERVICE_DELIVERY_INBOX = 'SD';
const DEFAULT_EMAIL_SUBJECT = '(No subject)';
const DEFAULT_EMAIL_CONTENT = 'This email did not include a text message.';

function normalizeTextField(value, fallback) {
    const normalized = String(value || '').trim();
    return normalized || fallback;
}

function normalizeAttachment(attachment) {
    const fileName = String(attachment.fileName || '').trim();
    const fileUrl = String(attachment.fileUrl || '').trim();
    if (!fileName || !fileUrl) {
        throw new Error('Attachment fileName and fileUrl are required');
    }
    if (!ALLOWED_ATTACHMENT_URI.test(fileUrl)) {
        throw new Error('Invalid attachment URL');
    }
    return {
        fileName,
        fileUrl,
        mimeType: attachment.mimeType ? String(attachment.mimeType).trim() : null,
        sizeBytes: attachment.sizeBytes !== undefined ? Number(attachment.sizeBytes) || null : null
    };
}

function normalizeEmail(row, attachments = []) {
    return {
        id: String(row.id),
        contactId: row.contact_id,
        contactName: row.contact_name,
        senderEmail: row.sender_email,
        recipientService: row.recipient_service || SERVICE_DELIVERY_INBOX,
        sourceMessageId: row.source_message_id || null,
        phone: row.phone,
        organizationId: row.organization_id,
        organization: row.organization,
        subject: row.subject,
        content: row.content,
        receivedAt: row.received_at,
        isRead: Boolean(row.is_read),
        attachments: attachments
            .filter((attachment) => attachment.email_id === row.id)
            .map((attachment) => ({
                id: attachment.id,
                fileName: attachment.file_name,
                mimeType: attachment.mime_type,
                fileUrl: attachment.file_url,
                sizeBytes: attachment.size_bytes
            }))
    };
}

async function listEmails(user) {
    const result = await clientEmailRepository.getAllEmails(user.id, SERVICE_DELIVERY_INBOX);
    return result.emails.map((email) => normalizeEmail(email, result.attachments));
}

async function receiveEmail(payload = {}) {
    const senderEmail = String(payload.senderEmail || '').trim().toLowerCase();
    if (!senderEmail) {
        throw new Error('senderEmail is required');
    }
    if (!EMAIL_PATTERN.test(senderEmail)) {
        throw new Error('Invalid email format');
    }

    const subject = normalizeTextField(payload.subject, DEFAULT_EMAIL_SUBJECT).slice(0, 255);
    const content = normalizeTextField(payload.content, DEFAULT_EMAIL_CONTENT);
    const contact = await clientEmailRepository.findContactByEmail(senderEmail);
    if (!contact) {
        throw new Error('Sender email does not belong to an existing client');
    }

    let receivedAt = null;
    if (payload.receivedAt) {
        const date = new Date(payload.receivedAt);
        if (Number.isNaN(date.getTime())) throw new Error('Invalid received date');
        receivedAt = date;
    }
    const attachments = Array.isArray(payload.attachments)
        ? payload.attachments.map(normalizeAttachment)
        : [];
    const sourceMessageId = payload.sourceMessageId ? String(payload.sourceMessageId).trim() : null;
    if (sourceMessageId && await clientEmailRepository.existsBySourceMessageId(sourceMessageId)) {
        return null;
    }

    const emailId = await clientEmailRepository.createEmail(contact.id, {
        senderEmail,
        recipientService: SERVICE_DELIVERY_INBOX,
        sourceMessageId,
        subject,
        content,
        receivedAt,
        attachments
    });
    const result = await clientEmailRepository.getEmailById(emailId, 0, SERVICE_DELIVERY_INBOX);
    return normalizeEmail(result.email, result.attachments);
}

async function markEmailRead(id, user) {
    const email = await clientEmailRepository.getEmailById(id, user.id, SERVICE_DELIVERY_INBOX);
    if (!email) throw new Error('Email not found');
    await clientEmailRepository.markAsRead(id, user.id);
    const result = await clientEmailRepository.getEmailById(id, user.id, SERVICE_DELIVERY_INBOX);
    return normalizeEmail(result.email, result.attachments);
}

module.exports = {
    listEmails,
    receiveEmail,
    markEmailRead,
    SERVICE_DELIVERY_INBOX
};

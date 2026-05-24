const THEME_PREFIX = 'agce-theme';
const DARK_THEME = 'dark';
const LIGHT_THEME = 'light';

function getThemeIdentity() {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.id || payload.userId || payload.username || payload.userName || null;
  } catch {
    return null;
  }
}

export function getThemeStorageKey() {
  const identity = getThemeIdentity();
  return identity ? `${THEME_PREFIX}:${identity}` : null;
}

export function getPreferredTheme() {
  const storageKey = getThemeStorageKey();
  return storageKey && localStorage.getItem(storageKey) === LIGHT_THEME ? LIGHT_THEME : DARK_THEME;
}

export function savePreferredTheme(theme) {
  const storageKey = getThemeStorageKey();
  if (storageKey) {
    localStorage.setItem(storageKey, theme === LIGHT_THEME ? LIGHT_THEME : DARK_THEME);
  }
}

export function applyPreferredTheme() {
  const isLoginPage = window.location.pathname === '/' || window.location.pathname === '/login';
  document.documentElement.dataset.theme = isLoginPage ? DARK_THEME : getPreferredTheme();
}

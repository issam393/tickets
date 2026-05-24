import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { getPreferredTheme, getThemeStorageKey, savePreferredTheme } from '../../lib/themePreference';
import './ThemeToggle.css';

export default function ThemeToggle() {
  const location = useLocation();
  const storageKey = getThemeStorageKey();
  const [theme, setTheme] = useState(getPreferredTheme);
  const isAuthenticated = Boolean(storageKey);
  const isLoginPage = location.pathname === '/' || location.pathname === '/login';

  useEffect(() => {
    if (isLoginPage) {
      document.documentElement.dataset.theme = 'dark';
      return;
    }

    const employeeTheme = getPreferredTheme();
    setTheme(employeeTheme);
    document.documentElement.dataset.theme = employeeTheme;
  }, [isLoginPage, storageKey]);

  if (!isAuthenticated || isLoginPage) {
    return null;
  }

  const isDark = theme === 'dark';

  return (
    <button
      className="global-theme-toggle"
      type="button"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
      onClick={() => {
        const nextTheme = isDark ? 'light' : 'dark';
        setTheme(nextTheme);
        savePreferredTheme(nextTheme);
        document.documentElement.dataset.theme = nextTheme;
      }}
    >
      <span className={`global-theme-toggle__track ${isDark ? 'is-dark' : 'is-light'}`}>
        <span className="global-theme-toggle__icon global-theme-toggle__sun">
          <Sun size={14} />
        </span>
        <span className="global-theme-toggle__icon global-theme-toggle__moon">
          <Moon size={14} />
        </span>
        <span className="global-theme-toggle__thumb">
          {isDark ? <Moon size={14} /> : <Sun size={14} />}
        </span>
      </span>
    </button>
  );
}

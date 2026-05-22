import { useEffect, useMemo, useState } from "react";
import { ShieldAlert, ArrowRight, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ACCESS_DENIED_MESSAGE, getDefaultRouteForRole } from "../../../lib/authAccess";
import "./AccessDenied.css";

function AccessDenied({ userRole = null }) {
  const navigate = useNavigate();
  const targetRoute = useMemo(() => getDefaultRouteForRole(userRole), [userRole]);
  const [secondsLeft, setSecondsLeft] = useState(5);
  const isLoginTarget = targetRoute === "/login";

  useEffect(() => {
    const tick = window.setInterval(() => {
      setSecondsLeft((current) => Math.max(0, current - 1));
    }, 1000);

    const redirect = window.setTimeout(() => {
      navigate(targetRoute, { replace: true });
    }, 5000);

    return () => {
      window.clearInterval(tick);
      window.clearTimeout(redirect);
    };
  }, [navigate, targetRoute]);

  return (
    <main className="access-denied-page">
      <section className="access-denied-card" aria-labelledby="access-denied-title">
        <div className="access-denied-icon">
          <ShieldAlert size={44} />
        </div>

        <p className="access-denied-eyebrow">Restricted section</p>
        <h1 id="access-denied-title">Access Denied</h1>
        <p className="access-denied-message">
          Your role does not have permission to view this section.
        </p>
        <p className="access-denied-detail">{ACCESS_DENIED_MESSAGE}</p>

        <div className="access-denied-actions">
          <button
            type="button"
            className="access-denied-primary"
            onClick={() => navigate(targetRoute, { replace: true })}
          >
            {isLoginTarget ? <LogIn size={18} /> : <ArrowRight size={18} />}
            {isLoginTarget ? "Go to login" : "Go to my section"}
          </button>
        </div>

        <p className="access-denied-countdown">
          Redirecting in {secondsLeft}s
        </p>
      </section>
    </main>
  );
}

export default AccessDenied;

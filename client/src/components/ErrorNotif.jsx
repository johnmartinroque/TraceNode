import { useEffect, useRef, useState } from "react";

/**
 * ErrorNotif
 * Polls your n8n "Poll For Errors" webhook and pops up a toast in the
 * bottom-right corner whenever a new error row shows up in Supabase.
 * Each toast auto-dismisses after `autoDismissMs`, or can be closed manually.
 *
 * n8n side: the webhook responds with { errors: [...], count }
 * and marks each returned row as "Notified" so it isn't shown twice.
 *
 * Usage:
 *   <ErrorNotif webhookUrl="https://your-n8n-instance/webhook/poll-errors" />
 */

const DEFAULT_WEBHOOK_URL = "http://localhost:5678/webhook/poll-errors";

export default function ErrorNotif({
  webhookUrl = DEFAULT_WEBHOOK_URL,
  pollIntervalMs = 8000,
  autoDismissMs = 7000,
}) {
  const [toasts, setToasts] = useState([]);
  const seenIds = useRef(new Set());
  const timersRef = useRef({});

  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      try {
        const res = await fetch(webhookUrl, { method: "GET" });
        if (!res.ok) return;
        const data = await res.json();
        const errors = Array.isArray(data?.errors) ? data.errors : [];

        const fresh = errors.filter((e) => e?.id && !seenIds.current.has(e.id));
        if (fresh.length === 0 || cancelled) return;

        fresh.forEach((e) => seenIds.current.add(e.id));

        setToasts((prev) => [...prev, ...fresh.map(toToast)]);

        fresh.forEach((e) => {
          const timer = setTimeout(() => dismiss(e.id), autoDismissMs);
          timersRef.current[e.id] = timer;
        });
      } catch (err) {
        // Network/webhook errors here are intentionally swallowed so the
        // notification poller never itself crashes the UI.
        console.error("ErrorNotif poll failed:", err);
      }
    };

    poll();
    const interval = setInterval(poll, pollIntervalMs);
    return () => {
      cancelled = true;
      clearInterval(interval);
      Object.values(timersRef.current).forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [webhookUrl, pollIntervalMs, autoDismissMs]);

  const dismiss = (id) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, closing: true } : t)),
    );
    // let the exit animation play before removing from the DOM
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 250);
    if (timersRef.current[id]) {
      clearTimeout(timersRef.current[id]);
      delete timersRef.current[id];
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="error-notif-stack" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`error-notif-toast${t.closing ? " closing" : ""}`}
          >
            <div className="error-notif-icon">!</div>
            <div className="error-notif-body">
              <div className="error-notif-title">
                {t.workflow_name || "Workflow error"}
              </div>
              <div className="error-notif-message">{t.error_description}</div>
              {t.workflow_link && (
                <a
                  className="error-notif-link"
                  href={t.workflow_link}
                  target="_blank"
                  rel="noreferrer"
                >
                  View execution →
                </a>
              )}
            </div>
            <button
              className="error-notif-close"
              aria-label="Dismiss"
              onClick={() => dismiss(t.id)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

function toToast(e) {
  return {
    id: e.id,
    workflow_name: e.workflow_name,
    error_description: e.error_description,
    workflow_link: e.workflow_link,
    closing: false,
  };
}

const styles = `
.error-notif-stack {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 360px;
  pointer-events: none;
}

.error-notif-toast {
  pointer-events: auto;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: #1f1f23;
  color: #f5f5f5;
  border: 1px solid #3a1d1d;
  border-left: 4px solid #ef4444;
  border-radius: 10px;
  padding: 12px 14px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
  animation: error-notif-in 0.25s ease-out;
}

@media (prefers-color-scheme: light) {
  .error-notif-toast {
    background: #ffffff;
    color: #1a1a1a;
    border: 1px solid #f1d3d3;
    border-left: 4px solid #ef4444;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }
}

.error-notif-toast.closing {
  animation: error-notif-out 0.25s ease-in forwards;
}

.error-notif-icon {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #ef4444;
  color: #fff;
  font-weight: 700;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-notif-body {
  flex: 1;
  min-width: 0;
}

.error-notif-title {
  font-weight: 600;
  font-size: 13px;
  margin-bottom: 2px;
}

.error-notif-message {
  font-size: 12.5px;
  line-height: 1.4;
  opacity: 0.85;
  word-break: break-word;
}

.error-notif-link {
  display: inline-block;
  margin-top: 6px;
  font-size: 12px;
  color: #60a5fa;
  text-decoration: none;
}

.error-notif-link:hover {
  text-decoration: underline;
}

.error-notif-close {
  flex-shrink: 0;
  background: transparent;
  border: none;
  color: inherit;
  opacity: 0.6;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  padding: 0 2px;
}

.error-notif-close:hover {
  opacity: 1;
}

@keyframes error-notif-in {
  from {
    opacity: 0;
    transform: translateX(24px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes error-notif-out {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(24px);
  }
}
`;

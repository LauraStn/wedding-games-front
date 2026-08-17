import { ApiError } from "../api/errors";

interface ErrorPanelProps {
  error: unknown;
  onRetry?: () => void;
  title?: string;
}

const RETRIABLE_KINDS = new Set(["offline", "server"]);

export function ErrorPanel({ error, onRetry, title }: ErrorPanelProps) {
  const message = error instanceof ApiError ? error.message : "Une erreur inattendue est survenue.";
  const kind = error instanceof ApiError ? error.kind : "unknown";
  const canRetry = onRetry !== undefined && RETRIABLE_KINDS.has(kind);

  return (
    <div className="error-panel" role="alert">
      <p className="error-panel__title">{title ?? "Un problème est survenu"}</p>
      <p className="error-panel__message">{message}</p>
      {canRetry && (
        <button type="button" className="btn btn--secondary" onClick={onRetry}>
          Réessayer
        </button>
      )}
    </div>
  );
}

interface LoadingScreenProps {
  label?: string;
}

export function LoadingScreen({ label = "Chargement…" }: LoadingScreenProps) {
  return (
    <div className="loading-screen" role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

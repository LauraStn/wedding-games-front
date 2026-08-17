interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: string;
}

/** Espace réservé honnête pour une fonctionnalité pas encore disponible : jamais de fausse donnée simulée. */
export function EmptyState({ title, description, icon = "✦" }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <span className="empty-state__icon" aria-hidden="true">
        {icon}
      </span>
      <p className="empty-state__title">{title}</p>
      {description && <p className="empty-state__description">{description}</p>}
    </div>
  );
}

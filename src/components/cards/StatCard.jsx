export function StatCard({ title, value, icon, variant }) {
  return (
    <article className="stat-card">
      <div>
        <p className="stat-card__title">{title}</p>
        <strong className="stat-card__value">{value}</strong>
      </div>

      <div className={`stat-card__icon stat-card__icon--${variant}`}>
        {icon}
      </div>
    </article>
  )
}
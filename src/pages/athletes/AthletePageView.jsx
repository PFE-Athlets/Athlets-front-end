import './styles/athlete-page-view.css'
import { Link } from 'react-router-dom'

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M11 5h2v14h-2z" />
      <path d="M5 11h14v2H5z" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M10.5 4a6.5 6.5 0 1 0 4.13 11.53l4.42 4.42 1.41-1.41-4.42-4.42A6.5 6.5 0 0 0 10.5 4Zm0 2a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Z" />
    </svg>
  )
}

function ResetIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 5a7 7 0 1 1-6.32 4H3l3.5-3.5L10 9H7.8A5 5 0 1 0 12 7V5Z" />
    </svg>
  )
}

const athleteStats = [
  {
    title: 'Athlètes actifs',
    value: 128,
    trend: '12,4%',
    comparison: 'vs avr. 2024',
    icon: '👥',
    variant: 'blue',
  },
  {
    title: 'Nouveaux athlètes',
    value: 8,
    trend: '33,3%',
    comparison: 'vs avr. 2024',
    icon: '👤+',
    variant: 'green',
  },
  {
    title: 'Athlètes non actifs',
    value: 15,
    trend: '7,1%',
    comparison: 'vs avr. 2024',
    icon: '👤⊘',
    variant: 'gray',
  },
]

export default function AthletePageView() {
  return (
    <section className="athlete-page">

      {/** Zone des cartes et création d'un athlète*/}
      <div className="athlete-page__top">
        <div className="athlete-stats">
          {athleteStats.map((stat) => (
            <article
              key={stat.title}
              className="athlete-stat-card"
            >
              <div>
                <p className="athlete-stat-card__title">
                  {stat.title}
                </p>

                <strong className="athlete-stat-card__value">
                  {stat.value}
                </strong>

                <div className="athlete-stat-card__trend">
                  <span>▲ {stat.trend}</span>
                  <small>{stat.comparison}</small>
                </div>
              </div>

              <div
                className={`athlete-stat-card__icon athlete-stat-card__icon--${stat.variant}`}
              >
                {stat.icon}
              </div>
            </article>
          ))}
        </div>

        <Link to="/athletes/creer" className="athlete-create-button">
          <PlusIcon />
          <span>Créer un athlète</span>
        </Link>
      </div>

      {/** Zone de filtre */}
      <div className="athlete-filters">
        <label className="athlete-search">
          <input type="search" placeholder="Rechercher un athlète..." />
          <SearchIcon />
        </label>

        <label className="athlete-filter">
          <span>Sport</span>
          <select defaultValue="all">
            <option value="all">Tous</option>
            <option value="athletisme">Athlétisme</option>
            <option value="rugby">Rugby</option>
            <option value="volley">Volley</option>
            <option value="badminton">Badminton</option>
          </select>
        </label>

        <label className="athlete-filter athlete-filter--wide">
          <span>Position / spécialisation</span>
          <select defaultValue="all">
            <option value="all">Toutes</option>
            <option value="sprint">Sprint 100 m</option>
            <option value="longue-distance">Longue distance</option>
            <option value="demi-melee">Demi de mêlée</option>
          </select>
        </label>

        <label className="athlete-filter">
          <span>Statut</span>
          <select defaultValue="all">
            <option value="all">Tous</option>
            <option value="active">Actif</option>
            <option value="inactive">Non actif</option>
          </select>
        </label>

        <button type="button" className="athlete-reset-button">
          <ResetIcon />
          <span>Réinitialiser</span>
        </button>
      </div>
    </section>
  )
}
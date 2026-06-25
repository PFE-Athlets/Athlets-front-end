import { useState } from 'react'
import '../../styles/page-view.css'
import { Link } from 'react-router-dom'
import { PlusIcon, SearchIcon, ResetIcon } from '../../components/Icons'

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

const SPORT_OPTIONS = [
  { value: 'all', label: 'Tous' },
  { value: 'athletisme', label: 'Athlétisme' },
  { value: 'rugby', label: 'Rugby' },
  { value: 'volley', label: 'Volley' },
  { value: 'badminton', label: 'Badminton' },
]

const POSITION_OPTIONS = [
  { value: 'all', label: 'Toutes' },
  { value: 'sprint', label: 'Sprint 100 m' },
  { value: 'longue-distance', label: 'Longue distance' },
  { value: 'demi-melee', label: 'Demi de mêlée' },
]

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tous' },
  { value: 'active', label: 'Actif' },
  { value: 'inactive', label: 'Non actif' },
]

const INITIAL_FILTERS = { search: '', sport: 'all', position: 'all', status: 'all' }

export default function AthletePageView() {
  // TODO: remplacer par un appel API (ex: useEffect + athleteService.getAll())
  const [athletes, setAthletes] = useState([])
  const [filters, setFilters] = useState(INITIAL_FILTERS)

  const updateFilter = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }))
  const resetFilters = () => setFilters(INITIAL_FILTERS)

  const filteredAthletes = athletes.filter((athlete) => {
    const fullName = `${athlete.prenom} ${athlete.nom}`.toLowerCase()
    const matchesSearch =
      filters.search === '' || fullName.includes(filters.search.toLowerCase())
    const matchesSport =
      filters.sport === 'all' || athlete.sport === filters.sport
    const matchesPosition =
      filters.position === 'all' || athlete.position === filters.position
    const matchesStatus =
      filters.status === 'all' || athlete.statut === filters.status
    return matchesSearch && matchesSport && matchesPosition && matchesStatus
  })

  return (
    <section className="list-page">

      {/** Zone des cartes et création d'un athlète */}
      <div className="list-page__top">
        <div className="stat-cards">
          {athleteStats.map((stat) => (
            <article key={stat.title} className="stat-card">
              <div>
                <p className="stat-card__title">{stat.title}</p>
                <strong className="stat-card__value">{stat.value}</strong>
                <div className="stat-card__trend">
                  <span>▲ {stat.trend}</span>
                  <small>{stat.comparison}</small>
                </div>
              </div>
              <div className={`stat-card__icon stat-card__icon--${stat.variant}`}>
                {stat.icon}
              </div>
            </article>
          ))}
        </div>

        <Link to="/athletes/creer" className="create-btn">
          <PlusIcon />
          <span>Créer un athlète</span>
        </Link>
      </div>

      {/** Zone de filtre */}
      <div className="list-filters">
        <label className="list-search">
          <input
            type="search"
            placeholder="Rechercher un athlète..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
          />
          <SearchIcon />
        </label>

        <div className="list-filter">
          <span>Sport</span>
          <select value={filters.sport} onChange={(e) => updateFilter('sport', e.target.value)}>
            {SPORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="list-filter list-filter--wide">
          <span>Spécialisation</span>
          <select value={filters.position} onChange={(e) => updateFilter('position', e.target.value)}>
            {POSITION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="list-filter">
          <span>Statut</span>
          <select value={filters.status} onChange={(e) => updateFilter('status', e.target.value)}>
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <button type="button" className="list-reset-btn" onClick={resetFilters}>
          <ResetIcon />
          <span>Réinitialiser</span>
        </button>
      </div>

      {/** TODO: afficher filteredAthletes dans un tableau */}
    </section>
  )
}
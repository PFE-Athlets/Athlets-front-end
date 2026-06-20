import { useState } from 'react'
import '../../styles/page-view.css'
import { Link } from 'react-router-dom'
import { PlusIcon, SearchIcon, ResetIcon } from '../../components/Icons'

const physicalTestStats = [
  {
    title: 'Tests physiques actifs',
    value: 3,
    trend: '12,4%',
    comparison: 'vs avr. 2024',
    icon: '🏃',
    variant: 'blue',
  },
  {
    title: 'Nouveaux tests physiques',
    value: 8,
    trend: '33,3%',
    comparison: 'vs avr. 2024',
    icon: '➕',
    variant: 'green',
  },
  {
    title: 'Tests physiques inactifs',
    value: 15,
    trend: '7,1%',
    comparison: 'vs avr. 2024',
    icon: '⊘',
    variant: 'gray',
  },
]

const CATEGORY_OPTIONS = [
  { value: 'all', label: 'Toutes' },
  { value: 'FORCE', label: 'Force' },
  { value: 'ENDURANCE', label: 'Endurance' },
  { value: 'VITESSE', label: 'Vitesse' },
  { value: 'AGILITE', label: 'Agilité' },
  { value: 'SOUPLESSE', label: 'Souplesse' },
]

const SPORT_OPTIONS = [
  { value: 'all', label: 'Tous' },
  { value: 'Rugby', label: 'Rugby' },
  { value: 'Athlétisme', label: 'Athlétisme' },
  { value: 'Soccer', label: 'Soccer' },
  { value: 'Basketball', label: 'Basketball' },
  { value: 'Volleyball', label: 'Volleyball' },
  { value: 'Cross-country', label: 'Cross-country' },
]

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tous' },
  { value: 'ACTIF', label: 'Actif' },
  { value: 'INACTIF', label: 'Non actif' },
]

const INITIAL_FILTERS = { search: '', categorie: 'all', sport: 'all', statut: 'all' }

export default function PhysicalTestPageView() {
  // TODO: remplacer par un appel API (ex: useEffect + physicalTestService.getAll())
  const [physicalTests, setPhysicalTests] = useState([])
  const [filters, setFilters] = useState(INITIAL_FILTERS)

  const updateFilter = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }))
  const resetFilters = () => setFilters(INITIAL_FILTERS)

  const filteredTests = physicalTests.filter((test) => {
    const matchesSearch =
      filters.search === '' || test.nom.toLowerCase().includes(filters.search.toLowerCase())
    const matchesCategorie =
      filters.categorie === 'all' || test.categorie === filters.categorie
    const matchesSport =
      filters.sport === 'all' || test.sport === filters.sport
    const matchesStatut =
      filters.statut === 'all' || test.statut === filters.statut
    return matchesSearch && matchesCategorie && matchesSport && matchesStatut
  })

  return (
    <section className="list-page">

      {/** Zone des cartes et création d'un test physique */}
      <div className="list-page__top">
        <div className="stat-cards">
          {physicalTestStats.map((stat) => (
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

        <Link to="/tests-physiques/creer" className="create-btn">
          <PlusIcon />
          <span>Créer un test physique</span>
        </Link>
      </div>

      {/** Zone de filtre */}
      <div className="list-filters">
        <label className="list-search">
          <input
            type="search"
            placeholder="Rechercher un test physique..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
          />
          <SearchIcon />
        </label>

        <div className="list-filter">
          <span>Catégorie</span>
          <select value={filters.categorie} onChange={(e) => updateFilter('categorie', e.target.value)}>
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="list-filter list-filter--wide">
          <span>Sport ciblé</span>
          <select value={filters.sport} onChange={(e) => updateFilter('sport', e.target.value)}>
            {SPORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="list-filter">
          <span>Statut</span>
          <select value={filters.statut} onChange={(e) => updateFilter('statut', e.target.value)}>
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

      {/** TODO: afficher filteredTests dans un tableau */}
    </section>
  )
}
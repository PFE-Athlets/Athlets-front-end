import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { athleteService } from '../../api/athleteService'
import '../../styles/page-view.css'
import {
  PlusIcon,
  SearchIcon,
  ResetIcon,
} from '../../components/Icons'
import { StatCard } from '../../components/cards/StatCard'
import { FilterSelect } from '../../components/filters/FilterSelect'

const INITIAL_FILTERS = {
  search: '',
  team: 'all',
  sport: 'all',
  status: 'all',
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tous' },
  { value: 'active', label: 'Actif' },
  { value: 'inactive', label: 'Non actif' },
  { value: 'pending', label: 'En attente' },
]

const PAGE_SIZE_OPTIONS = [5, 10, 15]

export default function AthletePageView() {
  const [athletes, setAthletes] = useState([])
  const [filters, setFilters] = useState(INITIAL_FILTERS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const navigate = useNavigate()

  useEffect(() => {
    const fetchAthletes = async () => {
      setLoading(true)
      setError('')

      const result = await athleteService.getDisplayAthletes()

      if (!result.success) {
        console.error(
          'Erreur lors du chargement des athlètes :',
          result.error,
        )

        setError(
          result.error ||
            'Une erreur est survenue lors du chargement des athlètes.',
        )

        setLoading(false)
        return
      }

      setAthletes(result.data)
      setLoading(false)
    }

    fetchAthletes()
  }, [])

  const teamOptions = useMemo(() => {
    const teams = [
      ...new Set(
        athletes.flatMap((athlete) => athlete.teams),
      ),
    ].sort((first, second) =>
      first.localeCompare(second, 'fr'),
    )

    return [
      { value: 'all', label: 'Toutes' },
      ...teams.map((team) => ({
        value: athleteService.helpers.normalizeText(team),
        label: team,
      })),
    ]
  }, [athletes])

  const sportOptions = useMemo(() => {
    const sports = [
      ...new Set(
        athletes.flatMap((athlete) => athlete.sports),
      ),
    ].sort((first, second) =>
      first.localeCompare(second, 'fr'),
    )

    return [
      { value: 'all', label: 'Tous' },
      ...sports.map((sport) => ({
        value: athleteService.helpers.normalizeText(sport),
        label: sport,
      })),
    ]
  }, [athletes])

  const filteredAthletes = useMemo(() => {
    return athletes.filter((athlete) => {
      const searchableText = [
        athlete.firstName,
        athlete.lastName,
        athlete.username,
        athlete.email,
        ...athlete.teams,
        ...athlete.sports,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      const searchValue =
        athleteService.helpers.normalizeText(filters.search)

      const normalizedTeams = athlete.teams.map(
        athleteService.helpers.normalizeText,
      )

      const normalizedSports = athlete.sports.map(
        athleteService.helpers.normalizeText,
      )

      const matchesSearch =
        searchValue === '' ||
        searchableText.includes(searchValue)

      const matchesTeam =
        filters.team === 'all' ||
        normalizedTeams.includes(filters.team)

      const matchesSport =
        filters.sport === 'all' ||
        normalizedSports.includes(filters.sport)

      const matchesStatus =
        filters.status === 'all' ||
        athlete.status === filters.status

      return (
        matchesSearch &&
        matchesTeam &&
        matchesSport &&
        matchesStatus
      )
    })
  }, [athletes, filters])

  const activeCount = athletes.filter(
    (athlete) => athlete.status === 'active',
  ).length

  const inactiveCount = athletes.filter(
    (athlete) => athlete.status === 'inactive',
  ).length

  const pendingCount = athletes.filter(
    (athlete) => athlete.status === 'pending',
  ).length

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAthletes.length / pageSize),
  )

  const currentPage = Math.min(page, totalPages)
  const startIndex = (currentPage - 1) * pageSize

  const visibleAthletes = filteredAthletes.slice(
    startIndex,
    startIndex + pageSize,
  )

  const firstDisplayed =
    filteredAthletes.length === 0
      ? 0
      : startIndex + 1

  const lastDisplayed = Math.min(
    startIndex + pageSize,
    filteredAthletes.length,
  )

  const visiblePages = Array.from(
    { length: totalPages },
    (_, index) => index + 1,
  ).filter(
    (pageNumber) =>
      pageNumber === 1 ||
      pageNumber === totalPages ||
      Math.abs(pageNumber - currentPage) <= 1,
  )

  const updateFilter = (key, value) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [key]: value,
    }))

    setPage(1)
  }

  const resetFilters = () => {
    setFilters(INITIAL_FILTERS)
    setPage(1)
  }

  const getStatusConfig = (athlete) => {
    const configurations = {
      active: {
        label: 'Actif',
        className: 'athlete-status-badge--active',
      },
      inactive: {
        label: 'Non actif',
        className: 'athlete-status-badge--inactive',
      },
      pending: {
        label: 'En attente',
        className: 'athlete-status-badge--pending',
      },
    }

    return (
      configurations[athlete.status] ??
      configurations.inactive
    )
  }

  return (
    <section className="list-page">
      <div className="list-page__top">
        <div className="stat-cards">
          <StatCard
            title="Athlètes actifs"
            value={activeCount}
            icon="👥"
            variant="blue"
          />

          <StatCard
            title="Athlètes non actifs"
            value={inactiveCount}
            icon="👤⊘"
            variant="gray"
          />

          <StatCard
            title="En attente"
            value={pendingCount}
            icon="⏳"
            variant="yellow"
          />
        </div>

        <Link
          to="/athletes/creer"
          className="create-btn"
        >
          <PlusIcon />
          <span>Créer un athlète</span>
        </Link>
      </div>

      <div className="list-filters">
        <label className="list-search">
          <input
            type="search"
            placeholder="Rechercher un athlète..."
            value={filters.search}
            onChange={(event) =>
              updateFilter('search', event.target.value)
            }
          />

          <SearchIcon />
        </label>

        <FilterSelect
          label="Équipe"
          value={filters.team}
          options={teamOptions}
          onChange={(value) =>
            updateFilter('team', value)
          }
        />

        <FilterSelect
          label="Sport"
          value={filters.sport}
          options={sportOptions}
          onChange={(value) =>
            updateFilter('sport', value)
          }
        />

        <FilterSelect
          label="Statut"
          value={filters.status}
          options={STATUS_OPTIONS}
          onChange={(value) =>
            updateFilter('status', value)
          }
        />

        <button
          type="button"
          className="list-reset-btn"
          onClick={resetFilters}
        >
          <ResetIcon />
          <span>Réinitialiser</span>
        </button>
      </div>

      {loading && (
        <div className="list-empty">
          Chargement des athlètes...
        </div>
      )}

      {!loading && error && (
        <div className="list-empty list-empty--error">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Athlète</th>
                <th>Équipe</th>
                <th>Sport</th>
                <th>Statut</th>
                <th>Actions</th>
                <th aria-label="Options" />
              </tr>
            </thead>

            <tbody>
              {visibleAthletes.map((athlete) => {
                const statusConfig = getStatusConfig(athlete)

                return (
                  <tr
                    key={athlete.id}
                    className="clickable-row"
                    onClick={() =>
                      navigate(`/athletes/${athlete.id}`)
                    }
                  >
                    <td className="cell--name">
                      {athlete.firstName} {athlete.lastName}
                    </td>

                    <td>
                      {athlete.teams.join(', ') ||
                        'Aucune équipe'}
                    </td>

                    <td>
                      {athlete.sports.join(', ') ||
                        'Non spécifié'}
                    </td>

                    <td className="athlete-status-cell">
                      <span
                        className={`athlete-status-badge ${statusConfig.className}`}
                      >
                        {statusConfig.label}
                      </span>
                    </td>

                    <td className="athlete-edit-cell">
                      <Link
                        to={`/athletes/${athlete.id}/modifier`}
                        className="edit-btn"
                        onClick={(event) => {
                          event.stopPropagation()
                        }}
                      >
                        Modifier
                      </Link>
                    </td>

                    <td className="athlete-menu-cell">
                      <button
                        type="button"
                        className="more-btn"
                        aria-label={`Plus d’options pour ${athlete.firstName} ${athlete.lastName}`}
                        onClick={(event) => {
                          event.stopPropagation()
                        }}
                      >
                        ⋮
                      </button>
                    </td>
                  </tr>
                )
              })}

              {visibleAthletes.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="table-empty-cell"
                  >
                    Aucun athlète trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="table-footer">
            <p className="table-footer__text">
              Affichage de {firstDisplayed} à{' '}
              {lastDisplayed} sur{' '}
              {filteredAthletes.length} athlètes
            </p>

            <div className="table-footer__controls">
              <select
                className="page-size"
                value={pageSize}
                onChange={(event) => {
                  setPageSize(Number(event.target.value))
                  setPage(1)
                }}
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option
                    key={size}
                    value={size}
                  >
                    {size} par page
                  </option>
                ))}
              </select>

              <div className="pagination">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() =>
                    setPage(currentPage - 1)
                  }
                  aria-label="Page précédente"
                >
                  ‹
                </button>

                {visiblePages.map((pageNumber, index) => {
                  const previousPage =
                    visiblePages[index - 1]

                  const showDots =
                    previousPage &&
                    pageNumber - previousPage > 1

                  return (
                    <span key={pageNumber}>
                      {showDots && (
                        <span className="pagination__dots">
                          …
                        </span>
                      )}

                      <button
                        type="button"
                        className={
                          pageNumber === currentPage
                            ? 'is-active'
                            : ''
                        }
                        onClick={() =>
                          setPage(pageNumber)
                        }
                      >
                        {pageNumber}
                      </button>
                    </span>
                  )
                })}

                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setPage(currentPage + 1)
                  }
                  aria-label="Page suivante"
                >
                  ›
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
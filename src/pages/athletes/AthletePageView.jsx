import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
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

  useEffect(() => {
    const fetchAthletes = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await fetch(
          'http://localhost:8080/api/athlete/all',
          {
            method: 'GET',
            credentials: 'include',
            headers: {
              Accept: 'application/json',
            },
          },
        )

        if (response.status === 401) {
          throw new Error(
            'Vous devez être connecté pour consulter les athlètes.',
          )
        }

        if (response.status === 403) {
          throw new Error(
            'Vous n’êtes pas autorisé à consulter la liste des athlètes.',
          )
        }

        if (!response.ok) {
          throw new Error(
            `Impossible de récupérer les athlètes. Erreur ${response.status}.`,
          )
        }

        const data = await response.json()
        setAthletes(Array.isArray(data) ? data : [])
      } catch (requestError) {
        console.error(
          'Erreur lors du chargement des athlètes :',
          requestError,
        )

        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Une erreur est survenue lors du chargement des athlètes.',
        )
      } finally {
        setLoading(false)
      }
    }

    fetchAthletes()
  }, [])

  const normalizeText = (value) =>
    String(value ?? '')
      .trim()
      .toLowerCase()

  const getAthleteStatus = (athlete) => {
    const rawStatus = athlete.authUser?.accountStatus
      ?.trim()
      .toUpperCase()

    if (rawStatus === 'ACTIVE') {
      return 'active'
    }

    if (rawStatus === 'A_ACTIVER') {
      return 'pending'
    }

    return 'inactive'
  }

  const getAthleteTeams = (athlete) => {
    const teams =
      athlete.teams
        ?.map((team) => team.name)
        .filter(Boolean) ?? []

    return [...new Set(teams)]
  }

  const getAthleteSports = (athlete) => {
    const teamSports =
      athlete.teams
        ?.map((team) => team.sport?.name)
        .filter(Boolean) ?? []

    const disciplineSports =
      athlete.disciplines
        ?.map((discipline) => discipline.sport?.name)
        .filter(Boolean) ?? []

    return [
      ...new Set([
        ...teamSports,
        ...disciplineSports,
      ]),
    ]
  }

  const teamOptions = useMemo(() => {
    const teams = [
      ...new Set(
        athletes.flatMap(getAthleteTeams),
      ),
    ].sort((first, second) =>
      first.localeCompare(second, 'fr'),
    )

    return [
      { value: 'all', label: 'Toutes' },
      ...teams.map((team) => ({
        value: normalizeText(team),
        label: team,
      })),
    ]
  }, [athletes])

  const sportOptions = useMemo(() => {
    const sports = [
      ...new Set(
        athletes.flatMap(getAthleteSports),
      ),
    ].sort((first, second) =>
      first.localeCompare(second, 'fr'),
    )

    return [
      { value: 'all', label: 'Tous' },
      ...sports.map((sport) => ({
        value: normalizeText(sport),
        label: sport,
      })),
    ]
  }, [athletes])

  const filteredAthletes = useMemo(() => {
    return athletes.filter((athlete) => {
      const user = athlete.authUser ?? {}
      const teams = getAthleteTeams(athlete)
      const sports = getAthleteSports(athlete)

      const searchableText = [
        user.firstName,
        user.lastName,
        user.username,
        user.email,
        ...teams,
        ...sports,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      const searchValue = normalizeText(filters.search)
      const normalizedTeams = teams.map(normalizeText)
      const normalizedSports = sports.map(normalizeText)
      const athleteStatus = getAthleteStatus(athlete)

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
        athleteStatus === filters.status

      return (
        matchesSearch &&
        matchesTeam &&
        matchesSport &&
        matchesStatus
      )
    })
  }, [athletes, filters])

  const activeCount = athletes.filter(
    (athlete) => getAthleteStatus(athlete) === 'active',
  ).length

  const inactiveCount = athletes.filter(
    (athlete) => getAthleteStatus(athlete) === 'inactive',
  ).length

  const pendingCount = athletes.filter(
    (athlete) => getAthleteStatus(athlete) === 'pending',
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
    const status = getAthleteStatus(athlete)

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

    return configurations[status]
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
                const user = athlete.authUser ?? {}
                const teams = getAthleteTeams(athlete)
                const sports = getAthleteSports(athlete)
                const statusConfig = getStatusConfig(athlete)

                return (
                  <tr key={user.id}>
                    <td className="cell--name">
                      {user.firstName} {user.lastName}
                    </td>

                    <td>
                      {teams.join(', ') || 'Aucune équipe'}
                    </td>

                    <td>
                      {sports.join(', ') || 'Non spécifié'}
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
                        to={`/athletes/${user.id}/modifier`}
                        className="edit-btn"
                      >
                        Modifier
                      </Link>
                    </td>

                    <td className="athlete-menu-cell">
                      <button
                        type="button"
                        className="more-btn"
                        aria-label={`Plus d’options pour ${user.firstName} ${user.lastName}`}
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
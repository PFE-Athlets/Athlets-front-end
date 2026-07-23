import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import '../../styles/page-view.css'
import '../../styles/team-page.css'
import {
  PlusIcon,
  ResetIcon,
  SearchIcon,
} from '../../components/Icons'
import { batterieTestsService } from '../../api/batterieTestsService'

const PAGE_SIZE_OPTIONS = [10, 20, 50]

const INITIAL_FILTERS = {
  search: '',
  team: 'all',
  status: 'all',
}

const STATUS_OPTIONS = [
  {
    value: 'all',
    label: 'Tous',
  },
  {
    value: 'ACTIVE',
    label: 'Active',
  },
  {
    value: 'INACTIVE',
    label: 'Inactive',
  },
]

const normalizeBatterieTests = (data) => {
  if (Array.isArray(data)) {
    return data
  }

  if (Array.isArray(data?.batterieTests)) {
    return data.batterieTests
  }

  if (Array.isArray(data?.testBatteries)) {
    return data.testBatteries
  }

  if (Array.isArray(data?.batteries)) {
    return data.batteries
  }

  if (Array.isArray(data?.content)) {
    return data.content
  }

  return []
}

const getBatterieId = (battery) => {
  return String(
    battery?.id ??
      battery?.batteryId ??
      battery?.batterieId ??
      battery?.testBatteryId ??
      '',
  )
}

const getBatterieName = (battery) => {
  return (
    battery?.name ??
    battery?.batteryName ??
    battery?.batterieName ??
    battery?.nomBatterie ??
    'Batterie sans nom'
  )
}

const getTeamName = (battery) => {
  return (
    battery?.team?.name ??
    battery?.team?.teamName ??
    battery?.teamName ??
    battery?.equipeName ??
    battery?.nomEquipe ??
    ''
  )
}

const getStatus = (battery) => {
  const status =
    battery?.status ??
    battery?.batteryStatus ??
    battery?.batterieStatus ??
    battery?.accountStatus ??
    ''

  return String(status).toUpperCase()
}

const getPhysicalTests = (battery) => {
  if (Array.isArray(battery?.physicalTests)) {
    return battery.physicalTests
  }

  if (Array.isArray(battery?.tests)) {
    return battery.tests
  }

  if (Array.isArray(battery?.testList)) {
    return battery.testList
  }

  return []
}

const getPhysicalTestsCount = (battery) => {
  const explicitCount =
    battery?.physicalTestsCount ??
    battery?.testsCount ??
    battery?.numberOfTests ??
    battery?.nombreTests

  if (explicitCount != null) {
    return Number(explicitCount)
  }

  return getPhysicalTests(battery).length
}

const getStatusLabel = (status) => {
  switch (status) {
    case 'ACTIVE':
      return 'Active'

    case 'INACTIVE':
      return 'Inactive'

    default:
      return status || 'Non spécifié'
  }
}

export default function BatterieTestsPageView({
  canCreateBatterieTests = true,
}) {
  const [batterieTests, setBatterieTests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [filters, setFilters] = useState(INITIAL_FILTERS)
  const [pageSize, setPageSize] = useState(
    PAGE_SIZE_OPTIONS[0],
  )
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    let cancelled = false

    const loadBatterieTests = async () => {
      setLoading(true)
      setError(null)

      try {
        const result = await batterieTestsService.getAll()

        if (cancelled) {
          return
        }

        if (result.success) {
          setBatterieTests(
            normalizeBatterieTests(result.data),
          )
        } else {
          setBatterieTests([])
          setError(
            result.error ??
              'Impossible de charger les batteries de tests.',
          )
        }
      } catch (loadError) {
        if (!cancelled) {
          console.error(
            'Erreur lors du chargement des batteries de tests :',
            loadError,
          )

          setBatterieTests([])
          setError(
            'Impossible de charger les batteries de tests.',
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadBatterieTests()

    return () => {
      cancelled = true
    }
  }, [])

  const updateFilter = (key, value) => {
    setFilters((previousFilters) => ({
      ...previousFilters,
      [key]: value,
    }))

    setCurrentPage(1)
  }

  const resetFilters = () => {
    setFilters(INITIAL_FILTERS)
    setCurrentPage(1)
  }

  const teamOptions = useMemo(() => {
    const teamNames = [
      ...new Set(
        batterieTests
          .map(getTeamName)
          .filter(Boolean),
      ),
    ].sort((firstTeam, secondTeam) =>
      firstTeam.localeCompare(secondTeam, 'fr'),
    )

    return [
      {
        value: 'all',
        label: 'Toutes',
      },
      ...teamNames.map((teamName) => ({
        value: teamName,
        label: teamName,
      })),
    ]
  }, [batterieTests])

  const filteredBatteries = useMemo(() => {
    const normalizedSearch = filters.search
      .trim()
      .toLowerCase()

    return batterieTests.filter((battery) => {
      const batteryName = getBatterieName(battery)
      const teamName = getTeamName(battery)
      const status = getStatus(battery)

      const matchesSearch =
        normalizedSearch === '' ||
        batteryName
          .toLowerCase()
          .includes(normalizedSearch)

      const matchesTeam =
        filters.team === 'all' ||
        teamName === filters.team

      const matchesStatus =
        filters.status === 'all' ||
        status === filters.status

      return (
        matchesSearch &&
        matchesTeam &&
        matchesStatus
      )
    })
  }, [batterieTests, filters])

  const totalPages = Math.max(
    1,
    Math.ceil(filteredBatteries.length / pageSize),
  )

  const safePage = Math.min(currentPage, totalPages)

  const startIndex =
    filteredBatteries.length === 0
      ? 0
      : (safePage - 1) * pageSize

  const endIndex = Math.min(
    startIndex + pageSize,
    filteredBatteries.length,
  )

  const visibleBatteries = filteredBatteries.slice(
    startIndex,
    endIndex,
  )

  return (
    <section className="list-page team-page">
      <div className="team-page__toolbar">
        <div className="team-page__filters">
          <label className="list-search team-page__search">
            <input
              type="search"
              placeholder="Rechercher une batterie de tests..."
              value={filters.search}
              onChange={(event) =>
                updateFilter(
                  'search',
                  event.target.value,
                )
              }
            />

            <SearchIcon />
          </label>

          <label className="list-filter team-page__sport-filter">
            <span>Équipe</span>

            <select
              value={filters.team}
              onChange={(event) =>
                updateFilter(
                  'team',
                  event.target.value,
                )
              }
            >
              {teamOptions.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="list-filter team-page__sport-filter">
            <span>Statut</span>

            <select
              value={filters.status}
              onChange={(event) =>
                updateFilter(
                  'status',
                  event.target.value,
                )
              }
            >
              {STATUS_OPTIONS.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            className="list-reset-btn"
            onClick={resetFilters}
          >
            <ResetIcon />
            <span>Réinitialiser</span>
          </button>
        </div>

        {canCreateBatterieTests ? (
          <Link
            to="/batterie-tests/creer"
            className="create-btn"
          >
            <PlusIcon />
            <span>Créer une batterie</span>
          </Link>
        ) : null}
      </div>

      <div className="team-table-card">
        <div className="table-wrapper">
          <table className="data-table team-table">
            <thead>
              <tr>
                <th>Nom de la batterie</th>
                <th>Équipe</th>
                <th>Nombre de tests</th>
                <th>Statut</th>
              </tr>
            </thead>

            <tbody>
              {visibleBatteries.length > 0 ? (
                visibleBatteries.map((battery) => {
                  const batteryId =
                    getBatterieId(battery)

                  const batteryName =
                    getBatterieName(battery)

                  const teamName =
                    getTeamName(battery)

                  const status = getStatus(battery)

                  const testsCount =
                    getPhysicalTestsCount(battery)

                  return (
                    <tr key={batteryId}>
                      <td className="cell--name">
                        <Link
                          className="team-table__team-link"
                          to={`/batterie-tests/${batteryId}`}
                          state={{
                            batterieTests: battery,
                          }}
                        >
                          {batteryName}
                        </Link>
                      </td>

                      <td>
                        {teamName || (
                          <span className="cell--muted">
                            Non spécifiée
                          </span>
                        )}
                      </td>

                      <td>{testsCount}</td>

                      <td>
                        {status === 'ACTIVE' ? (
                          <span className="badge badge--blue">
                            {getStatusLabel(status)}
                          </span>
                        ) : status === 'INACTIVE' ? (
                          <span className="cell--muted">
                            {getStatusLabel(status)}
                          </span>
                        ) : (
                          <span className="cell--muted">
                            {getStatusLabel(status)}
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="list-empty"
                  >
                    {loading
                      ? 'Chargement des batteries de tests...'
                      : error
                        ? error
                        : 'Aucune batterie de tests ne correspond aux filtres.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="team-table__footer">
          <p className="team-table__count">
            {loading
              ? 'Chargement en cours...'
              : filteredBatteries.length === 0
                ? 'Aucune batterie de tests à afficher'
                : `Affichage de ${startIndex + 1} à ${endIndex} sur ${filteredBatteries.length} batteries de tests`}
          </p>

          <div className="team-table__pagination">
            <label className="team-table__page-size">
              <select
                value={pageSize}
                onChange={(event) => {
                  setPageSize(
                    Number(event.target.value),
                  )
                  setCurrentPage(1)
                }}
              >
                {PAGE_SIZE_OPTIONS.map((option) => (
                  <option
                    key={option}
                    value={option}
                  >
                    {option} par page
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              className="team-table__nav-btn"
              onClick={() =>
                setCurrentPage((page) =>
                  Math.max(1, page - 1),
                )
              }
              disabled={safePage === 1}
              aria-label="Page précédente"
            >
              <span aria-hidden="true">‹</span>
            </button>

            <span className="team-table__page-indicator">
              {safePage}
            </span>

            <button
              type="button"
              className="team-table__nav-btn"
              onClick={() =>
                setCurrentPage((page) =>
                  Math.min(totalPages, page + 1),
                )
              }
              disabled={
                safePage === totalPages ||
                filteredBatteries.length === 0
              }
              aria-label="Page suivante"
            >
              <span aria-hidden="true">›</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
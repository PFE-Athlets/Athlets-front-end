import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import '../../styles/page-view.css'
import '../../styles/batterie-tests-page.css'

import {
  PlusIcon,
  ResetIcon,
  SearchIcon,
} from '../../components/Icons'

import { physicalTestService } from '../../api/physicalTestService'

const PAGE_SIZE = 8

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
    label: 'Actives',
  },
  {
    value: 'INACTIVE',
    label: 'Inactives',
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

const getBatterieDescription = (battery) => {
  return (
    battery?.description ??
    battery?.informations ??
    battery?.information ??
    battery?.details ??
    battery?.batteryDescription ??
    battery?.batterieDescription ??
    ''
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

  return String(status).trim().toUpperCase()
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

  if (explicitCount !== null && explicitCount !== undefined) {
    const parsedCount = Number(explicitCount)

    return Number.isNaN(parsedCount)
      ? getPhysicalTests(battery).length
      : parsedCount
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

function SortIndicator() {
  return (
    <span
      className="batterie-tests-table__sort"
      aria-hidden="true"
    >
      <span>⌃</span>
      <span>⌄</span>
    </span>
  )
}

function StatusBadge({ status }) {
  const normalizedStatus = String(status)
    .trim()
    .toUpperCase()

  const isActive = normalizedStatus === 'ACTIVE'
  const isInactive = normalizedStatus === 'INACTIVE'

  return (
    <span
      className={[
        'batterie-tests-status',
        isActive
          ? 'batterie-tests-status--active'
          : isInactive
            ? 'batterie-tests-status--inactive'
            : 'batterie-tests-status--unknown',
      ].join(' ')}
    >
      {getStatusLabel(normalizedStatus)}
    </span>
  )
}

export default function BatterieTestsPageView({
  canCreateBatterieTests = true,
  canEditBatterieTests = true,
}) {
  const [batterieTests, setBatterieTests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [filters, setFilters] = useState(INITIAL_FILTERS)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    let cancelled = false

    const loadBatterieTests = async () => {
      setLoading(true)
      setError(null)

      try {
        const result =
          await physicalTestService.getByAllBatteries()

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
      const batteryName =
        getBatterieName(battery).toLowerCase()

      const batteryDescription =
        getBatterieDescription(battery).toLowerCase()

      const teamName = getTeamName(battery)
      const status = getStatus(battery)

      const matchesSearch =
        normalizedSearch === '' ||
        batteryName.includes(normalizedSearch) ||
        batteryDescription.includes(normalizedSearch) ||
        teamName.toLowerCase().includes(normalizedSearch)

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
    Math.ceil(filteredBatteries.length / PAGE_SIZE),
  )

  const safePage = Math.min(
    currentPage,
    totalPages,
  )

  const startIndex =
    filteredBatteries.length === 0
      ? 0
      : (safePage - 1) * PAGE_SIZE

  const endIndex = Math.min(
    startIndex + PAGE_SIZE,
    filteredBatteries.length,
  )

  const visibleBatteries =
    filteredBatteries.slice(
      startIndex,
      endIndex,
    )

  return (
    <section className="batterie-tests-page">
      <header className="batterie-tests-page__header">
        <div>
          <h1>Batteries de tests</h1>

          <p>
            Consultez les batteries de tests associées à
            vos équipes.
          </p>
        </div>

        {canCreateBatterieTests ? (
          <Link
            to="/batterie-tests/creer"
            className="batterie-tests-page__create"
          >
            <PlusIcon />
            <span>Créer une batterie</span>
          </Link>
        ) : null}
      </header>

      <div className="batterie-tests-card">
        <div className="batterie-tests-filters">
          <label className="batterie-tests-search">
            <SearchIcon />

            <input
              type="search"
              placeholder="Rechercher une batterie..."
              value={filters.search}
              onChange={(event) =>
                updateFilter(
                  'search',
                  event.target.value,
                )
              }
            />
          </label>

          <label className="batterie-tests-filter">
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

          <label className="batterie-tests-filter">
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
            className="batterie-tests-reset"
            onClick={resetFilters}
          >
            <ResetIcon />
            <span>Réinitialiser</span>
          </button>
        </div>

        <div className="batterie-tests-table-wrapper">
          <table className="batterie-tests-table">
            <thead>
              <tr>
                <th>
                  <span>
                    Nom de la batterie
                    <SortIndicator />
                  </span>
                </th>

                <th>
                  <span>
                    Équipe
                    <SortIndicator />
                  </span>
                </th>

                <th>
                  <span>
                    Nombre de tests
                    <SortIndicator />
                  </span>
                </th>

                <th>
                  <span>
                    Statut
                    <SortIndicator />
                  </span>
                </th>

                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {visibleBatteries.length > 0 ? (
                visibleBatteries.map((battery) => {
                  const batteryId =
                    getBatterieId(battery)

                  const batteryName =
                    getBatterieName(battery)

                  const batteryDescription =
                    getBatterieDescription(battery)

                  const teamName =
                    getTeamName(battery)

                  const status =
                    getStatus(battery)

                  const testsCount =
                    getPhysicalTestsCount(battery)

                  return (
                    <tr key={batteryId}>
                      <td>
                        <div className="batterie-tests-table__name">
                          <Link
                            to={`/batterie-tests/${batteryId}`}
                            state={{
                              batterieTests: battery,
                            }}
                          >
                            {batteryName}
                          </Link>

                          {batteryDescription ? (
                            <p>
                              {batteryDescription}
                            </p>
                          ) : null}
                        </div>
                      </td>

                      <td>
                        <span className="batterie-tests-table__team">
                          {teamName ||
                            'Non spécifiée'}
                        </span>
                      </td>

                      <td>
                        <span className="batterie-tests-table__count">
                          {testsCount}{' '}
                          {testsCount > 1
                            ? 'tests'
                            : 'test'}
                        </span>
                      </td>

                      <td>
                        <StatusBadge
                          status={status}
                        />
                      </td>

                      <td>
                        {canEditBatterieTests ? (
                          <Link
                            to={`/batterie-tests/${batteryId}/modifier`}
                            state={{
                              batterieTests: battery,
                            }}
                            className="batterie-tests-table__edit"
                          >
                            Modifier
                          </Link>
                        ) : (
                          <span className="batterie-tests-table__no-action">
                            —
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="batterie-tests-table__empty"
                  >
                    {loading
                      ? 'Chargement des batteries de tests...'
                      : error ??
                        'Aucune batterie de tests ne correspond aux filtres.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <footer className="batterie-tests-footer">
          <p>
            {loading
              ? 'Chargement en cours...'
              : filteredBatteries.length === 0
                ? 'Aucune batterie à afficher'
                : `Affichage de ${startIndex + 1} à ${endIndex} sur ${filteredBatteries.length} batteries`}
          </p>

          <div className="batterie-tests-pagination">
            <button
              type="button"
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

            <span className="batterie-tests-pagination__current">
              {safePage}
            </span>

            <button
              type="button"
              onClick={() =>
                setCurrentPage((page) =>
                  Math.min(
                    totalPages,
                    page + 1,
                  ),
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
        </footer>
      </div>
    </section>
  )
}
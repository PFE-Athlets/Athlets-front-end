import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { resultService } from '../../api/resultService'
import {
  CalendarIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  DownloadIcon,
  EyeIcon,
  FilterIcon,
  MoreVerticalIcon,
  ResetIcon,
  SettingsIcon,
  PlusIcon
} from '../../components/Icons'

import '../../styles/results-page.css'

const INITIAL_FILTERS = {
  startDate: '',
  endDate: '',
  athlete: 'all',
  test: 'all',
  team: 'all',
  status: 'all',
  battery: 'all',
}

const PAGE_SIZE_OPTIONS = [10, 20, 50]

const DATE_FORMATTER = new Intl.DateTimeFormat('fr-CA', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

const STATUS_LABELS = {
  APPROVED: 'Approuvé',
  PENDING: 'En attente d’approbation',
  REJECTED: 'Refusé',
  ASSIGNED: 'Assigné',
}

const ROLE_LABELS = {
  ADMIN: 'Administrateur',
  COACH: 'Coach',
  ATHLETE: 'Athlète',
  KINE: 'Kinésiologue',
}

const formatDateLine = (value) => {
  if (!value) {
    return 'Date inconnue'
  }

  return DATE_FORMATTER.format(
    new Date(`${value}T00:00:00`),
  )
}

const getStatusLabel = (code, fallback) => {
  const normalizedCode = String(code ?? '')
    .trim()
    .toUpperCase()

  return (
    STATUS_LABELS[normalizedCode] ??
    fallback ??
    'Statut inconnu'
  )
}

const getStatusClassName = (code) => {
  switch (String(code ?? '').trim().toUpperCase()) {
    case 'APPROVED':
      return 'results-status-badge--approved'

    case 'PENDING':
      return 'results-status-badge--pending'

    case 'REJECTED':
      return 'results-status-badge--rejected'

    default:
      return 'results-status-badge--draft'
  }
}

const getRoleLabel = (role) => {
  const normalizedRole = String(role ?? '')
    .trim()
    .toUpperCase()

  return (
    ROLE_LABELS[normalizedRole] ??
    role ??
    '—'
  )
}

const getInitials = (label) => {
  return String(label ?? '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

const buildVisiblePages = (
  currentPage,
  totalPages,
) => {
  return Array.from(
    { length: totalPages },
    (_, index) => index + 1,
  ).filter(
    (pageNumber) =>
      pageNumber === 1 ||
      pageNumber === totalPages ||
      Math.abs(pageNumber - currentPage) <= 1,
  )
}

const toOptions = (items, defaultLabel) => [
  {
    value: 'all',
    label: defaultLabel,
  },
  ...items.map((item) => ({
    value: String(
      item.value ?? item.id ?? item.code,
    ),
    label: item.label,
  })),
]

export default function ResultPageView() {
  const [results, setResults] = useState([])

  const [filterData, setFilterData] = useState({
    minDate: '',
    maxDate: '',
    athletes: [],
    tests: [],
    teams: [],
    batteries: [],
    statuses: [],
  })

  const [draftFilters, setDraftFilters] = useState(INITIAL_FILTERS)

  const [appliedFilters, setAppliedFilters] = useState(INITIAL_FILTERS)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [exportError, setExportError] = useState('')
  const [exporting, setExporting] = useState(false)

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const [filtersExpanded, setFiltersExpanded] = useState(true)

  const navigate = useNavigate()

  useEffect(() => {
    let cancelled = false

    const loadPageData = async () => {
      setLoading(true)
      setError('')

      const result =
        await resultService.getPageData()

      if (cancelled) {
        return
      }

      if (!result.success) {
        console.error(
          'Erreur lors du chargement des résultats :',
          result.error,
        )

        setResults([])

        setError(
          result.error ??
            'Impossible de charger les résultats.',
        )

        setLoading(false)
        return
      }

      const nextFilterData = result.data.filters

      const initialFilters = {
        ...INITIAL_FILTERS,
        startDate:
          nextFilterData.minDate ?? '',
        endDate:
          nextFilterData.maxDate ?? '',
      }

      setResults(result.data.results)
      setFilterData(nextFilterData)
      setDraftFilters(initialFilters)
      setAppliedFilters(initialFilters)
      setLoading(false)
    }

    loadPageData()

    return () => {
      cancelled = true
    }
  }, [])

  const athleteOptions = useMemo(
    () =>
      toOptions(
        filterData.athletes,
        'Tous les athlètes',
      ),
    [filterData.athletes],
  )

  const testOptions = useMemo(
    () =>
      toOptions(
        filterData.tests,
        'Tous les tests',
      ),
    [filterData.tests],
  )

  const teamOptions = useMemo(
    () =>
      toOptions(
        filterData.teams,
        'Toutes les équipes',
      ),
    [filterData.teams],
  )

  const batteryOptions = useMemo(
    () =>
      toOptions(
        filterData.batteries,
        'Toutes les batteries',
      ),
    [filterData.batteries],
  )

  const statusOptions = useMemo(
    () =>
      toOptions(
        filterData.statuses.map((item) => ({
          value:
            item.value ?? item.code,
          label: getStatusLabel(
            item.value ?? item.code,
            item.label,
          ),
        })),
        'Tous les statuts',
      ),
    [filterData.statuses],
  )

  const filteredResults = useMemo(() => {
    return results.filter((result) => {
      const matchesStartDate =
        appliedFilters.startDate === '' ||
        result.testDate >=
          appliedFilters.startDate

      const matchesEndDate =
        appliedFilters.endDate === '' ||
        result.testDate <=
          appliedFilters.endDate

      const matchesAthlete =
        appliedFilters.athlete === 'all' ||
        String(result.athlete.id) ===
          appliedFilters.athlete

      const matchesTest =
        appliedFilters.test === 'all' ||
        String(result.test.id) ===
          appliedFilters.test

      const matchesTeam =
        appliedFilters.team === 'all' ||
        String(result.team?.id ?? '') ===
          appliedFilters.team

      const matchesStatus =
        appliedFilters.status === 'all' ||
        result.statusCode ===
          appliedFilters.status

      const matchesBattery =
        appliedFilters.battery === 'all' ||
        String(result.battery?.id ?? '') ===
          appliedFilters.battery

      return (
        matchesStartDate &&
        matchesEndDate &&
        matchesAthlete &&
        matchesTest &&
        matchesTeam &&
        matchesStatus &&
        matchesBattery
      )
    })
  }, [appliedFilters, results])

  const totalPages = Math.max(
    1,
    Math.ceil(filteredResults.length / pageSize),
  )

  const currentPage = Math.min(page, totalPages)

  const startIndex =
    (currentPage - 1) * pageSize

  const visibleResults = filteredResults.slice(
    startIndex,
    startIndex + pageSize,
  )

  const visiblePages = buildVisiblePages(
    currentPage,
    totalPages,
  )

  const updateDraftFilter = (key, value) => {
    setDraftFilters((currentFilters) => ({
      ...currentFilters,
      [key]: value,
    }))
  }

  const applyFilters = () => {
    setAppliedFilters({
      ...draftFilters,
    })

    setPage(1)
  }

  const resetFilters = () => {
    const initialFilters = {
      ...INITIAL_FILTERS,
      startDate:
        filterData.minDate ?? '',
      endDate:
        filterData.maxDate ?? '',
    }

    setDraftFilters(initialFilters)
    setAppliedFilters(initialFilters)
    setPage(1)
  }

  const handleExport = async () => {
    setExportError('')
    setExporting(true)

    const result =
      await resultService.exportResults(
        appliedFilters,
      )

    if (!result.success) {
      setExportError(
        result.error ??
          'Impossible d’exporter les résultats.',
      )

      setExporting(false)
      return
    }

    const blob = new Blob([result.data], {
      type:
        result.contentType ||
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })

    const url = URL.createObjectURL(blob)

    const link =
      document.createElement('a')

    link.href = url
    link.download =
      result.filename || 'resultats.xlsx'

    document.body.appendChild(link)
    link.click()
    link.remove()

    URL.revokeObjectURL(url)

    setExporting(false)
  }

  return (
    <section className="results-page">
      <div className="results-page__intro">
        <div className="results-page__title-row">
          <h1>Résultats</h1>

          <button
            type="button"
            className="results-add-btn"
            onClick={() => navigate('/resultats/creer')}
          >
            <PlusIcon />
            <span>Ajouter un résultat</span>
          </button>
        </div>

        <p>
          Consultez et gérez les résultats des tests de vos athlètes.
        </p>
      </div>

      <section className="results-filters-card">
        <div className="results-filters-card__header">
          <h2>Filtres</h2>

          <button
            type="button"
            className="results-icon-btn results-icon-btn--collapse"
            onClick={() =>
              setFiltersExpanded(
                (expanded) => !expanded,
              )
            }
            aria-label={
              filtersExpanded
                ? 'Réduire les filtres'
                : 'Afficher les filtres'
            }
          >
            {filtersExpanded ? (
              <ChevronUpIcon />
            ) : (
              <ChevronDownIcon />
            )}
          </button>
        </div>

        {filtersExpanded && (
          <div className="results-filters-card__body">
            <div className="results-filters-grid results-filters-grid--top">
              <label className="results-field results-field--period">
                <span>Période</span>

                <div className="results-period-inputs">
                  <input
                    type="date"
                    min={
                      filterData.minDate ||
                      undefined
                    }
                    max={
                      draftFilters.endDate ||
                      filterData.maxDate ||
                      undefined
                    }
                    value={
                      draftFilters.startDate
                    }
                    onChange={(event) =>
                      updateDraftFilter(
                        'startDate',
                        event.target.value,
                      )
                    }
                    aria-label="Date de début"
                  />

                  <span className="results-period-separator">
                    —
                  </span>

                  <input
                    type="date"
                    min={
                      draftFilters.startDate ||
                      filterData.minDate ||
                      undefined
                    }
                    max={
                      filterData.maxDate ||
                      undefined
                    }
                    value={
                      draftFilters.endDate
                    }
                    onChange={(event) =>
                      updateDraftFilter(
                        'endDate',
                        event.target.value,
                      )
                    }
                    aria-label="Date de fin"
                  />

                  <span className="results-period-icon">
                    <CalendarIcon />
                  </span>
                </div>
              </label>

              <label className="results-field">
                <span>Athlète</span>

                <select
                  value={
                    draftFilters.athlete
                  }
                  onChange={(event) =>
                    updateDraftFilter(
                      'athlete',
                      event.target.value,
                    )
                  }
                >
                  {athleteOptions.map(
                    (option) => (
                      <option
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </option>
                    ),
                  )}
                </select>
              </label>

              <label className="results-field">
                <span>Test</span>

                <select
                  value={draftFilters.test}
                  onChange={(event) =>
                    updateDraftFilter(
                      'test',
                      event.target.value,
                    )
                  }
                >
                  {testOptions.map(
                    (option) => (
                      <option
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </option>
                    ),
                  )}
                </select>
              </label>

              <label className="results-field">
                <span>Équipe</span>

                <select
                  value={draftFilters.team}
                  onChange={(event) =>
                    updateDraftFilter(
                      'team',
                      event.target.value,
                    )
                  }
                >
                  {teamOptions.map(
                    (option) => (
                      <option
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </option>
                    ),
                  )}
                </select>
              </label>

              <label className="results-field">
                <span>Statut</span>

                <select
                  value={
                    draftFilters.status
                  }
                  onChange={(event) =>
                    updateDraftFilter(
                      'status',
                      event.target.value,
                    )
                  }
                >
                  {statusOptions.map(
                    (option) => (
                      <option
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </option>
                    ),
                  )}
                </select>
              </label>
            </div>

            <div className="results-filters-grid results-filters-grid--bottom">
              <label className="results-field results-field--battery">
                <span>Batterie de tests</span>

                <select
                  value={
                    draftFilters.battery
                  }
                  onChange={(event) =>
                    updateDraftFilter(
                      'battery',
                      event.target.value,
                    )
                  }
                >
                  {batteryOptions.map(
                    (option) => (
                      <option
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </option>
                    ),
                  )}
                </select>
              </label>

              <div className="results-filters-actions">
                <button
                  type="button"
                  className="results-reset-btn"
                  onClick={resetFilters}
                >
                  <ResetIcon />

                  <span>
                    Réinitialiser les filtres
                  </span>
                </button>

                <button
                  type="button"
                  className="results-apply-btn"
                  onClick={applyFilters}
                >
                  <FilterIcon />

                  <span>
                    Appliquer les filtres
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      <div className="results-toolbar">
        <p className="results-toolbar__count">
          {filteredResults.length} résultat
          {filteredResults.length !== 1
            ? 's'
            : ''}{' '}
          trouvé
          {filteredResults.length !== 1
            ? 's'
            : ''}
        </p>

        <div className="results-toolbar__actions">
          <button
            type="button"
            className="results-toolbar-btn"
            onClick={handleExport}
            disabled={
              filteredResults.length === 0 ||
              exporting
            }
          >
            <DownloadIcon />

            <span>
              {exporting
                ? 'Export en cours...'
                : 'Exporter'}
            </span>
          </button>

          <button
            type="button"
            className="results-icon-btn results-icon-btn--square"
            aria-label="Paramètres d’affichage"
          >
            <SettingsIcon />
          </button>
        </div>
      </div>

      {exportError && (
        <div className="results-state-card results-state-card--error">
          {exportError}
        </div>
      )}

      {loading ? (
        <div className="results-state-card">
          Chargement des résultats...
        </div>
      ) : error ? (
        <div className="results-state-card results-state-card--error">
          {error}
        </div>
      ) : (
        <div className="results-table-card">
          <div className="results-table-wrapper">
            <table className="results-table">
              <thead>
                <tr>
                  <th>
                    <div className="results-table-sort">
                      <span>
                        Date de saisie
                      </span>

                      <span
                        className="results-sort-arrow"
                        aria-hidden="true"
                      >
                        ↑
                      </span>
                    </div>
                  </th>

                  <th>Athlète</th>
                  <th>Test</th>
                  <th>Batterie de tests</th>
                  <th>Équipe</th>
                  <th>Intervenant</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {visibleResults.map(
                  (result) => (
                    <tr
                      key={result.id}
                      className="results-table-row"
                      onClick={() =>
                        navigate(`/resultats/${result.id}`)
                      }
                    >
                      <td data-label="Date de saisie">
                        <div className="results-date-cell">
                          <strong>
                            {formatDateLine(
                              result.testDate,
                            )}
                          </strong>

                          <span>
                            {result.testTime ||
                              '—'}
                          </span>
                        </div>
                      </td>

                      <td data-label="Athlète">
                        <div className="results-athlete-cell">
                          <span className="results-athlete-avatar">
                            {getInitials(
                              result.athlete
                                .displayName,
                            )}
                          </span>

                          <div className="results-athlete-info">
                            <strong>
                              {
                                result.athlete
                                  .displayName
                              }
                            </strong>

                            <span>
                              #
                              {
                                result.athlete
                                  .id
                              }
                            </span>
                          </div>
                        </div>
                      </td>

                      <td data-label="Test">
                        {result.test.name}
                      </td>

                      <td data-label="Batterie de tests">
                        {result.battery
                          ?.name || '—'}
                      </td>

                      <td data-label="Équipe">
                        {result.team?.name ||
                          '—'}
                      </td>

                      <td data-label="Intervenant">
                        <div className="results-intervenant-cell">
                          <strong>
                            {result.intervenant
                              ?.displayName ||
                              '—'}
                          </strong>

                          <span>
                            {getRoleLabel(
                              result.intervenant
                                ?.role,
                            )}
                          </span>
                        </div>
                      </td>

                      <td data-label="Statut">
                        <span
                          className={`results-status-badge ${getStatusClassName(
                            result.statusCode,
                          )}`}
                        >
                          {getStatusLabel(
                            result.statusCode,
                            result.statusLabel,
                          )}
                        </span>
                      </td>

                      <td data-label="Actions">
                        <div className="results-actions-cell">
                          <button
                            type="button"
                            className="results-action-btn"
                            aria-label={`Plus d’actions pour le résultat ${result.id}`}
                            onClick={(event) => {
                              event.stopPropagation()
                            }}
                          >
                            <MoreVerticalIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ),
                )}

                {visibleResults.length ===
                  0 && (
                  <tr>
                    <td
                      colSpan="8"
                      className="results-table__empty"
                    >
                      Aucun résultat trouvé
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="results-pagination-bar">
            <div className="results-pagination-bar__left">
              <select
                value={pageSize}
                onChange={(event) => {
                  setPageSize(
                    Number(
                      event.target.value,
                    ),
                  )

                  setPage(1)
                }}
              >
                {PAGE_SIZE_OPTIONS.map(
                  (size) => (
                    <option
                      key={size}
                      value={size}
                    >
                      {size}
                    </option>
                  ),
                )}
              </select>

              <span>par page</span>
            </div>

            <div className="results-pagination">
              <button
                type="button"
                disabled={
                  currentPage === 1
                }
                onClick={() =>
                  setPage(
                    currentPage - 1,
                  )
                }
                aria-label="Page précédente"
              >
                ‹
              </button>

              {visiblePages.map(
                (
                  pageNumber,
                  index,
                ) => {
                  const previousPage =
                    visiblePages[
                      index - 1
                    ]

                  const showDots =
                    previousPage &&
                    pageNumber -
                      previousPage >
                      1

                  return (
                    <span
                      key={
                        pageNumber
                      }
                    >
                      {showDots && (
                        <span className="results-pagination__dots">
                          …
                        </span>
                      )}

                      <button
                        type="button"
                        className={
                          pageNumber ===
                          currentPage
                            ? 'is-active'
                            : ''
                        }
                        onClick={() =>
                          setPage(
                            pageNumber,
                          )
                        }
                      >
                        {
                          pageNumber
                        }
                      </button>
                    </span>
                  )
                },
              )}

              <button
                type="button"
                disabled={
                  currentPage ===
                  totalPages
                }
                onClick={() =>
                  setPage(
                    currentPage + 1,
                  )
                }
                aria-label="Page suivante"
              >
                ›
              </button>
            </div>

            <p className="results-pagination-bar__right">
              {filteredResults.length ===
              0
                ? '0 résultat'
                : `${startIndex + 1} à ${Math.min(
                    startIndex +
                      pageSize,
                    filteredResults.length,
                  )} de ${
                    filteredResults.length
                  } résultats`}
            </p>
          </div>
        </div>
      )}
    </section>
  )
}
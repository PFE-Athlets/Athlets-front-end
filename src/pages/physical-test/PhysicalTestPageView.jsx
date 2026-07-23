import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import '../../styles/page-view.css'
import '../../styles/team-page.css'
import { PlusIcon, ResetIcon, SearchIcon } from '../../components/Icons'
import { physicalTestService } from '../../api/physicalTestService'

const PAGE_SIZE_OPTIONS = [10, 20, 50]

const INITIAL_FILTERS = {
  search: '',
  physicalQuality: 'all',
}

const getPhysicalQualityName = (test) => {
  return (
    test?.physicalQuality?.name ??
    test?.physicalQuality?.physicalQualityName ??
    test?.physicalQualityName ??
    test?.qualityName ??
    ''
  )
}

const normalizePhysicalTests = (data) => {
  if (Array.isArray(data)) {
    return data
  }

  if (Array.isArray(data?.physicalTests)) {
    return data.physicalTests
  }

  if (Array.isArray(data?.content)) {
    return data.content
  }

  return []
}

export default function PhysicalTestPageView({
  canCreatePhysicalTest = true,
}) {
  const [physicalTests, setPhysicalTests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState(INITIAL_FILTERS)
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0])
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    let cancelled = false

    const loadPhysicalTests = async () => {
      setLoading(true)
      setError(null)

      try {
        const result = await physicalTestService.getAll()

        if (cancelled) {
          return
        }

        if (result.success) {
          setPhysicalTests(normalizePhysicalTests(result.data))
        } else {
          setPhysicalTests([])
          setError(result.error)
        }
      } catch (loadError) {
        if (!cancelled) {
          console.error(
            'Erreur lors du chargement des tests physiques :',
            loadError,
          )

          setPhysicalTests([])
          setError('Impossible de charger les tests physiques.')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadPhysicalTests()

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

  const physicalQualityOptions = useMemo(() => {
    const qualities = [
      ...new Set(
        physicalTests
          .map(getPhysicalQualityName)
          .filter(Boolean),
      ),
    ].sort((firstQuality, secondQuality) =>
      firstQuality.localeCompare(secondQuality, 'fr'),
    )

    return [
      {
        value: 'all',
        label: 'Toutes',
      },
      ...qualities.map((quality) => ({
        value: quality,
        label: quality,
      })),
    ]
  }, [physicalTests])

  const filteredTests = useMemo(() => {
    const normalizedSearch = filters.search.trim().toLowerCase()

    return physicalTests.filter((test) => {
      const testName = test?.name ?? ''
      const physicalQualityName = getPhysicalQualityName(test)

      const matchesSearch =
        normalizedSearch === '' ||
        testName.toLowerCase().includes(normalizedSearch)

      const matchesPhysicalQuality =
        filters.physicalQuality === 'all' ||
        physicalQualityName === filters.physicalQuality

      return matchesSearch && matchesPhysicalQuality
    })
  }, [physicalTests, filters])

  const totalPages = Math.max(
    1,
    Math.ceil(filteredTests.length / pageSize),
  )

  const safePage = Math.min(currentPage, totalPages)

  const startIndex =
    filteredTests.length === 0
      ? 0
      : (safePage - 1) * pageSize

  const endIndex = Math.min(
    startIndex + pageSize,
    filteredTests.length,
  )

  const visibleTests = filteredTests.slice(
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
              placeholder="Rechercher un test physique..."
              value={filters.search}
              onChange={(event) =>
                updateFilter('search', event.target.value)
              }
            />

            <SearchIcon />
          </label>

          <label className="list-filter team-page__sport-filter">
            <span>Qualité physique</span>

            <select
              value={filters.physicalQuality}
              onChange={(event) =>
                updateFilter(
                  'physicalQuality',
                  event.target.value,
                )
              }
            >
              {physicalQualityOptions.map((option) => (
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

        {canCreatePhysicalTest ? (
          <Link
            to="/tests-physiques/creer"
            className="create-btn"
          >
            <PlusIcon />
            <span>Créer un test physique</span>
          </Link>
        ) : null}
      </div>

      <div className="team-table-card">
        <div className="table-wrapper">
          <table className="data-table team-table">
            <thead>
              <tr>
                <th>Nom du test</th>
                <th>Qualité physique évaluée</th>
                <th>Supervisé</th>
                <th>Preuve requise</th>
              </tr>
            </thead>

            <tbody>
              {visibleTests.length > 0 ? (
                visibleTests.map((test) => {
                  const physicalQualityName =
                    getPhysicalQualityName(test)

                  return (
                    <tr key={test.id}>
                      <td className="cell--name">
                        <Link
                          className="team-table__team-link"
                          to={`/tests-physiques/${test.id}`}
                          state={{ physicalTest: test }}
                        >
                          {test.name}
                        </Link>
                      </td>

                      <td>
                        {physicalQualityName || (
                          <span className="cell--muted">
                            Non spécifiée
                          </span>
                        )}
                      </td>

                      <td>
                        {test.supervised ? (
                          <span className="badge badge--blue">
                            Oui
                          </span>
                        ) : (
                          <span className="cell--muted">
                            Non
                          </span>
                        )}
                      </td>

                      <td>
                        {test.proofRequired ? (
                          <span className="badge badge--blue">
                            Oui
                          </span>
                        ) : (
                          <span className="cell--muted">
                            Non
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
                      ? 'Chargement des tests physiques...'
                      : error
                        ? error
                        : 'Aucun test physique ne correspond aux filtres.'}
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
              : filteredTests.length === 0
                ? 'Aucun test physique à afficher'
                : `Affichage de ${startIndex + 1} à ${endIndex} sur ${filteredTests.length} tests physiques`}
          </p>

          <div className="team-table__pagination">
            <label className="team-table__page-size">
              <select
                value={pageSize}
                onChange={(event) => {
                  setPageSize(Number(event.target.value))
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
                filteredTests.length === 0
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
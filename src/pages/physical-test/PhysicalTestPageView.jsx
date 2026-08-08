import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import '../../styles/page-view.css'
import '../../styles/physical-test-page.css'

import {
  PlusIcon,
  ResetIcon,
  SearchIcon,
} from '../../components/Icons'

import { physicalTestService } from '../../api/physicalTestService'

const PAGE_SIZE = 8

const INITIAL_FILTERS = {
  search: '',
  physicalQuality: 'all',
  supervision: 'all',
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

const getTestDescription = (test) => {
  return (
    test?.informations ??
    test?.description ??
    test?.protocol ??
    ''
  )
}

const normalizeBoolean = (value) => {
  if (typeof value === 'boolean') {
    return value
  }

  if (typeof value === 'number') {
    return value === 1
  }

  if (typeof value === 'string') {
    return ['true', '1', 'oui', 'yes'].includes(
      value.trim().toLowerCase(),
    )
  }

  return false
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

function BooleanBadge({ value }) {
  const isActive = normalizeBoolean(value)

  return (
    <span
      className={
        isActive
          ? 'physical-test-badge physical-test-badge--yes'
          : 'physical-test-badge physical-test-badge--no'
      }
    >
      {isActive ? 'Oui' : 'Non'}
    </span>
  )
}

function SortIndicator() {
  return (
    <span
      className="physical-test-table__sort"
      aria-hidden="true"
    >
      <span>⌃</span>
      <span>⌄</span>
    </span>
  )
}

export default function PhysicalTestPageView({
  canCreatePhysicalTest = true,
}) {
  const [physicalTests, setPhysicalTests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [filters, setFilters] = useState(INITIAL_FILTERS)
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
          setPhysicalTests(
            normalizePhysicalTests(result.data),
          )
        } else {
          setPhysicalTests([])
          setError(
            result.error ??
              'Impossible de charger les tests physiques.',
          )
        }
      } catch (loadError) {
        if (!cancelled) {
          console.error(
            'Erreur lors du chargement des tests physiques :',
            loadError,
          )

          setPhysicalTests([])
          setError(
            'Impossible de charger les tests physiques.',
          )
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
      firstQuality.localeCompare(
        secondQuality,
        'fr',
      ),
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
    const normalizedSearch = filters.search
      .trim()
      .toLowerCase()

    return physicalTests.filter((test) => {
      const testName = test?.name ?? ''
      const physicalQualityName =
        getPhysicalQualityName(test)

      const supervised = normalizeBoolean(
        test?.supervised,
      )

      const matchesSearch =
        normalizedSearch === '' ||
        testName
          .toLowerCase()
          .includes(normalizedSearch) ||
        physicalQualityName
          .toLowerCase()
          .includes(normalizedSearch)

      const matchesPhysicalQuality =
        filters.physicalQuality === 'all' ||
        physicalQualityName ===
          filters.physicalQuality

      const matchesSupervision =
        filters.supervision === 'all' ||
        String(supervised) ===
          filters.supervision

      return (
        matchesSearch &&
        matchesPhysicalQuality &&
        matchesSupervision
      )
    })
  }, [physicalTests, filters])

  const totalPages = Math.max(
    1,
    Math.ceil(filteredTests.length / PAGE_SIZE),
  )

  const safePage = Math.min(
    currentPage,
    totalPages,
  )

  const startIndex =
    filteredTests.length === 0
      ? 0
      : (safePage - 1) * PAGE_SIZE

  const endIndex = Math.min(
    startIndex + PAGE_SIZE,
    filteredTests.length,
  )

  const visibleTests = filteredTests.slice(
    startIndex,
    endIndex,
  )

  return (
    <section className="physical-test-page">
      <header className="physical-test-page__header">
        <div>
          <h1>Tests</h1>

          <p>
            Gérez les tests physiques disponibles dans
            la plateforme.
          </p>
        </div>

        {canCreatePhysicalTest ? (
          <Link
            to="/tests-physiques/creer"
            className="physical-test-page__create"
          >
            <PlusIcon />
            <span>Créer un test</span>
          </Link>
        ) : null}
      </header>

      <div className="physical-test-card">
        <div className="physical-test-filters">
          <label className="physical-test-search">
            <SearchIcon />

            <input
              type="search"
              placeholder="Rechercher un test..."
              value={filters.search}
              onChange={(event) =>
                updateFilter(
                  'search',
                  event.target.value,
                )
              }
            />
          </label>

          <label className="physical-test-filter">
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
              {physicalQualityOptions.map(
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

          <label className="physical-test-filter">
            <span>Supervision</span>

            <select
              value={filters.supervision}
              onChange={(event) =>
                updateFilter(
                  'supervision',
                  event.target.value,
                )
              }
            >
              <option value="all">Toutes</option>
              <option value="true">Supervisés</option>
              <option value="false">
                Non supervisés
              </option>
            </select>
          </label>

          <button
            type="button"
            className="physical-test-reset"
            onClick={resetFilters}
          >
            <ResetIcon />
            <span>Réinitialiser</span>
          </button>
        </div>

        <div className="physical-test-table-wrapper">
          <table className="physical-test-table">
            <thead>
              <tr>
                <th>
                  <span>
                    Nom du test
                    <SortIndicator />
                  </span>
                </th>

                <th>
                  <span>
                    Qualité physique évaluée
                    <SortIndicator />
                  </span>
                </th>

                <th>
                  <span>
                    Supervisé
                    <SortIndicator />
                  </span>
                </th>

                <th>
                  <span>
                    Preuve requise
                    <SortIndicator />
                  </span>
                </th>
              </tr>
            </thead>

            <tbody>
              {visibleTests.length > 0 ? (
                visibleTests.map((test) => {
                  const physicalQualityName =
                    getPhysicalQualityName(test)

                  const description =
                    getTestDescription(test)

                  return (
                    <tr key={test.id}>
                      <td>
                        <div className="physical-test-table__name">
                          <Link
                            to={`/tests-physiques/${test.id}`}
                            state={{
                              physicalTest: test,
                            }}
                          >
                            {test.name ??
                              'Test sans nom'}
                          </Link>

                          {description ? (
                            <p>{description}</p>
                          ) : null}
                        </div>
                      </td>

                      <td>
                        <span className="physical-test-table__quality">
                          {physicalQualityName ||
                            'Non spécifiée'}
                        </span>
                      </td>

                      <td>
                        <BooleanBadge
                          value={test.supervised}
                        />
                      </td>

                      <td>
                        <BooleanBadge
                          value={test.proofRequired}
                        />
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="physical-test-table__empty"
                  >
                    {loading
                      ? 'Chargement des tests physiques...'
                      : error ??
                        'Aucun test physique ne correspond aux filtres.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <footer className="physical-test-footer">
          <p>
            {loading
              ? 'Chargement en cours...'
              : filteredTests.length === 0
                ? 'Aucun test à afficher'
                : `Affichage de ${startIndex + 1} à ${endIndex} sur ${filteredTests.length} tests`}
          </p>

          <div className="physical-test-pagination">
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

            <span className="physical-test-pagination__current">
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
                filteredTests.length === 0
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
import { useState, useEffect, useMemo } from 'react'
import '../../styles/page-view.css'
import { Link } from 'react-router-dom'
import { PlusIcon, SearchIcon, ResetIcon } from '../../components/Icons'
import { physicalTestService } from '../../api/physicalTestService'

const UNIT_LABELS = { s: 'Secondes', kg: 'Kilogrammes', m: 'Mètres', reps: 'Répétitions' }

const INITIAL_FILTERS = { search: '', sport: 'all' }

export default function PhysicalTestPageView() {
  const [physicalTests, setPhysicalTests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState(INITIAL_FILTERS)

  useEffect(() => {
    physicalTestService.getAll().then((result) => {
      if (result.success) {
        setPhysicalTests(result.data)
      } else {
        setError(result.error)
      }
      setLoading(false)
    })
  }, [])

  const sportOptions = useMemo(() => {
    const names = physicalTests.flatMap((t) => t.sports.map((s) => s.name))
    const unique = [...new Set(names)].sort()
    return [{ value: 'all', label: 'Tous' }, ...unique.map((s) => ({ value: s, label: s }))]
  }, [physicalTests])

  const updateFilter = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }))
  const resetFilters = () => setFilters(INITIAL_FILTERS)

  const filteredTests = physicalTests.filter((test) => {
    const matchesSearch =
      filters.search === '' || test.name.toLowerCase().includes(filters.search.toLowerCase())
    const matchesSport =
      filters.sport === 'all' || test.sports.some((s) => s.name === filters.sport)
    return matchesSearch && matchesSport
  })

  return (
    <section className="list-page">

      <div className="list-page__top">
        <p className="tests-count">
          {loading ? '…' : `${physicalTests.length} test(s) physique(s)`}
        </p>
        <Link to="/tests-physiques/creer" className="create-btn">
          <PlusIcon />
          <span>Créer un test physique</span>
        </Link>
      </div>

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

        <div className="list-filter list-filter--wide">
          <span>Sport ciblé</span>
          <select value={filters.sport} onChange={(e) => updateFilter('sport', e.target.value)}>
            {sportOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <button type="button" className="list-reset-btn" onClick={resetFilters}>
          <ResetIcon />
          <span>Réinitialiser</span>
        </button>
      </div>

      {loading && <p className="list-empty">Chargement…</p>}

      {error && <p className="list-empty list-empty--error">{error}</p>}

      {!loading && !error && filteredTests.length === 0 && (
        <p className="list-empty">Aucun test physique trouvé.</p>
      )}

      {!loading && !error && filteredTests.length > 0 && (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nom du test</th>
                <th>Unité de mesure</th>
                <th>Sports associés</th>
                <th>Preuve vidéo</th>
              </tr>
            </thead>
            <tbody>
              {filteredTests.map((test) => (
                <tr key={test.id}>
                  <td className="cell--name">{test.name}</td>
                  <td>{UNIT_LABELS[test.unit] ?? test.unit}</td>
                  <td>
                    {test.sports.length > 0
                      ? test.sports.map((s) => s.name).join(', ')
                      : <span className="cell--muted">Aucun</span>}
                  </td>
                  <td>
                    {test.proof
                      ? <span className="badge badge--blue">{test.proof}</span>
                      : <span className="cell--muted">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </section>
  )
}

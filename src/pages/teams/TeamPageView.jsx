import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../../styles/page-view.css'
import '../../styles/team-page.css'
import { PlusIcon, ResetIcon, SearchIcon } from '../../components/Icons'
import { teamService } from '../../api/teamService'

const PAGE_SIZE_OPTIONS = [10, 20, 50]
const INITIAL_FILTERS = { search: '', sport: 'all' }

export default function TeamPageView() {
  const navigate = useNavigate()
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState(INITIAL_FILTERS)
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0])
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    let cancelled = false

    const loadTeams = async () => {
      setLoading(true)
      setError(null)

      const result = await teamService.getDisplayTeams()

      if (cancelled) {
        return
      }

      if (result.success) {
        setTeams(result.data)
      } else {
        setTeams([])
        setError(result.error)
      }

      setLoading(false)
    }

    loadTeams()

    return () => {
      cancelled = true
    }
  }, [])

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  const resetFilters = () => {
    setFilters(INITIAL_FILTERS)
    setCurrentPage(1)
  }

  const sportOptions = useMemo(() => {
    const sports = [...new Set(teams.map((team) => team.sport).filter(Boolean))]
    return [{ value: 'all', label: 'Tous' }, ...sports.map((sport) => ({ value: sport, label: sport }))]
  }, [teams])

  const filteredTeams = useMemo(() => {
    return teams.filter((team) => {
      const matchesSearch =
        filters.search === '' || team.name.toLowerCase().includes(filters.search.toLowerCase())
      const matchesSport = filters.sport === 'all' || team.sport === filters.sport
      return matchesSearch && matchesSport
    })
  }, [teams, filters])

  const totalPages = Math.max(1, Math.ceil(filteredTeams.length / pageSize))
  const safePage = Math.min(currentPage, totalPages)
  const startIndex = filteredTeams.length === 0 ? 0 : (safePage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, filteredTeams.length)
  const visibleTeams = filteredTeams.slice(startIndex, endIndex)

  return (
    <section className="list-page team-page">
      <div className="team-page__toolbar">
        <div className="team-page__filters">
          <label className="list-search team-page__search">
            <input
              type="search"
              placeholder="Rechercher une équipe..."
              value={filters.search}
              onChange={(event) => updateFilter('search', event.target.value)}
            />
            <SearchIcon />
          </label>

          <label className="list-filter team-page__sport-filter">
            <span>Sport</span>
            <select value={filters.sport} onChange={(event) => updateFilter('sport', event.target.value)}>
              {sportOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>

          <button type="button" className="list-reset-btn" onClick={resetFilters}>
            <ResetIcon />
            <span>Réinitialiser</span>
          </button>
        </div>

        <Link to="/equipes/creer" className="create-btn">
          <PlusIcon />
          <span>Créer une équipe</span>
        </Link>
      </div>

      <div className="team-table-card">
        <div className="table-wrapper">
          <table className="data-table team-table">
            <thead>
              <tr>
                <th>Nom de l&apos;équipe</th>
                <th>Sport</th>
                <th>Nombre d&apos;athlètes associés</th>
                <th>Coach en chef</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {visibleTeams.length > 0 ? (
                visibleTeams.map((team) => (
                  <tr key={team.id}>
                    <td className="cell--name">
                      <Link className="team-table__team-link" to={`/equipes/${team.id}`}>
                        {team.name}
                      </Link>
                    </td>
                    <td>{team.sport}</td>
                    <td>{team.athletesCount}</td>
                    <td>{team.headCoach}</td>
                    <td>
                      <div className="team-table__actions">
                        <button
                          type="button"
                          className="team-table__edit-btn"
                          onClick={() => navigate(`/equipes/${team.id}/modifier`, { state: { team } })}
                        >
                          Modifier
                        </button>
                        <button type="button" className="team-table__menu-btn" aria-label={`Plus d'actions pour ${team.name}`}>
                          <span aria-hidden="true">⋮</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="list-empty">
                    {loading
                      ? 'Chargement des équipes...'
                      : error
                        ? error
                        : 'Aucune equipe ne correspond aux filtres.'}
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
              : filteredTeams.length === 0
              ? 'Aucune équipe à afficher'
              : `Affichage de ${startIndex + 1} à ${endIndex} sur ${filteredTeams.length} équipes`}
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
                  <option key={option} value={option}>{option} par page</option>
                ))}
              </select>
            </label>

            <button
              type="button"
              className="team-table__nav-btn"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={safePage === 1}
              aria-label="Page precedente"
            >
              <span aria-hidden="true">‹</span>
            </button>

            <span className="team-table__page-indicator">{safePage}</span>

            <button
              type="button"
              className="team-table__nav-btn"
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              disabled={safePage === totalPages || filteredTeams.length === 0}
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
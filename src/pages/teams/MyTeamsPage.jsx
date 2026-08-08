import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { athleteService } from '../../api/athleteService'
import '../../styles/page-view.css'
import '../../styles/my-teams.css'

const mapTeamFromAthlete = (team) => ({
  id: team?.id != null ? String(team.id) : '',
  name: team?.name ?? 'Équipe sans nom',
  sport: team?.sport?.name ?? '—',
})

const dedupeTeams = (teams) => {
  const seen = new Set()

  return teams.filter((team) => {
    const key = `${team.id}|${team.name}`

    if (seen.has(key)) {
      return false
    }

    seen.add(key)
    return true
  })
}

export default function MyTeamsPage() {
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    const loadMyTeams = async () => {
      setLoading(true)
      setError('')

      const result = await athleteService.getCurrentAthlete()

      if (cancelled) {
        return
      }

      if (!result.success) {
        setTeams([])
        setError(
          result.error ||
            'Impossible de charger vos équipes pour le moment.',
        )
        setLoading(false)
        return
      }

      const athleteTeams = Array.isArray(result.data?.teams)
        ? result.data.teams
        : []

      setTeams(dedupeTeams(athleteTeams.map(mapTeamFromAthlete)))
      setLoading(false)
    }

    loadMyTeams()

    return () => {
      cancelled = true
    }
  }, [])

  const hasTeams = useMemo(() => teams.length > 0, [teams])

  return (
    <section className="list-page my-teams-page">
      <p className="my-teams-page__subtitle">
        Retrouvez ici toutes les équipes associées à votre profil athlète.
      </p>

      <div className="my-teams-card">
        <div className="table-wrapper">
          <table className="data-table my-teams-table">
            <thead>
              <tr>
                <th>Nom de l&apos;équipe</th>
                <th>Sport</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="3" className="list-empty">
                    Chargement de vos équipes...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="3" className="list-empty">
                    {error}
                  </td>
                </tr>
              ) : hasTeams ? (
                teams.map((team) => (
                  <tr key={`${team.id}-${team.name}`}>
                    <td className="cell--name">{team.name}</td>
                    <td>{team.sport}</td>
                    <td>
                      {team.id ? (
                        <Link
                          className="my-teams-table__link"
                          to={`/equipes/${team.id}`}
                          state={{ team }}
                        >
                          Voir la fiche
                        </Link>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="list-empty">
                    Vous n&apos;êtes associé à aucune équipe pour le moment.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

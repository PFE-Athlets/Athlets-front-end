import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import api from '../../api/config'
import '../../styles/team-details.css'
import { TEAM_ATHLETES_BY_ID, TEAM_ROWS } from './teamData'

const DEFAULT_ATHLETES = [
  { id: 1, name: 'Athlète exemple', position: 'Position', status: 'Actif' },
]

export default function TeamDetailsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { teamId } = useParams()
  const [subcoachNames, setSubcoachNames] = useState([])
  const [subcoachesLoading, setSubcoachesLoading] = useState(true)
  const [subcoachesError, setSubcoachesError] = useState(null)

  const team = useMemo(() => {
    const fallbackTeam = TEAM_ROWS.find((item) => String(item.id) === String(teamId)) ?? TEAM_ROWS[0]
    const sourceTeam = location.state?.team ?? fallbackTeam

    return {
      id: sourceTeam?.id ?? fallbackTeam?.id ?? '',
      name: sourceTeam?.name ?? fallbackTeam?.name ?? 'Équipe sans nom',
      sport: sourceTeam?.sport ?? fallbackTeam?.sport ?? '—',
      athletesCount: sourceTeam?.athletesCount ?? fallbackTeam?.athletesCount ?? 0,
      headCoach: sourceTeam?.headCoach ?? fallbackTeam?.headCoach ?? '—',
      assistantCoaches: Array.isArray(sourceTeam?.assistantCoaches)
        ? sourceTeam.assistantCoaches
        : Array.isArray(fallbackTeam?.assistantCoaches)
          ? fallbackTeam.assistantCoaches
          : [],
    }
  }, [teamId, location.state])

  const athletes = TEAM_ATHLETES_BY_ID[Number(team.id)] ?? DEFAULT_ATHLETES

  useEffect(() => {
    let cancelled = false

    const loadSubcoaches = async () => {
      setSubcoachesLoading(true)
      setSubcoachesError(null)

      try {
        const response = await api.get(`/api/team/subcoaches/${team.id ?? teamId}`)
        const names = Array.isArray(response.data)
          ? response.data
              .map((item) => item?.subcoachName)
              .filter((name) => typeof name === 'string' && name.trim() !== '')
          : []

        if (!cancelled) {
          setSubcoachNames(names)
        }
      } catch {
        if (!cancelled) {
          setSubcoachNames([])
          setSubcoachesError('Impossible de charger les coachs secondaires.')
        }
      } finally {
        if (!cancelled) {
          setSubcoachesLoading(false)
        }
      }
    }

    if (team.id || teamId) {
      loadSubcoaches()
    } else {
      setSubcoachesLoading(false)
      setSubcoachNames([])
    }

    return () => {
      cancelled = true
    }
  }, [team.id, teamId])

  return (
    <section className="team-details-page">
      <p className="team-details-page__subtitle">Consultez les informations de l&apos;équipe et les athlètes associés.</p>

      <article className="team-details-card">
        <section className="team-details-section">
          <h2>Informations générales</h2>
          <div className="team-details-grid team-details-grid--three">
            <div>
              <p className="team-details-label">Nom de l&apos;équipe</p>
              <p className="team-details-value">{team.name}</p>
            </div>
            <div>
              <p className="team-details-label">Sport</p>
              <p className="team-details-value">{team.sport}</p>
            </div>
            <div>
              <p className="team-details-label">Nombre d&apos;athlètes associés</p>
              <p className="team-details-value">{team.athletesCount}</p>
            </div>
          </div>
        </section>

        <section className="team-details-section">
          <h2>Encadrement</h2>
          <div className="team-details-grid team-details-grid--three">
            <div>
              <p className="team-details-label">Coach principal</p>
              <p className="team-details-value">{team.headCoach}</p>
            </div>
            <div>
              <p className="team-details-label">Coach(s) secondaire(s)</p>
              <div className="team-details-chips">
                {subcoachesLoading ? (
                  <span className="team-details-value">Chargement...</span>
                ) : subcoachesError ? (
                  <span className="team-details-value">{subcoachesError}</span>
                ) : subcoachNames.length > 0 ? (
                  subcoachNames.map((name) => (
                    <span key={name} className="team-details-chip">{name}</span>
                  ))
                ) : (
                  <span className="team-details-value">—</span>
                )}
              </div>
            </div>
            <div>
              <p className="team-details-label">Kiné(s)</p>
              <div className="team-details-chips">
                <span className="team-details-value">TODO: brancher la gestion des kinés</span>
              </div>
            </div>
          </div>
        </section>

        <section className="team-details-section team-details-section--last">
          <h2>Athlètes associés</h2>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Athlète</th>
                  <th>Position</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {athletes.map((athlete) => (
                  <tr key={athlete.id}>
                    <td className="cell--name">{athlete.name}</td>
                    <td>{athlete.position}</td>
                    <td>
                      <span className={`team-details-status ${athlete.status === 'Actif' ? 'team-details-status--active' : 'team-details-status--inactive'}`}>
                        {athlete.status}
                      </span>
                    </td>
                    <td>
                      <button type="button" className="team-details-profile-btn">Voir le profil</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="team-details-actions">
          <button type="button" className="btn-secondary" onClick={() => navigate('/equipes')}>
            Retour
          </button>
        </div>
      </article>
    </section>
  )
}
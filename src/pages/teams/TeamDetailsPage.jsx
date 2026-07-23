import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { athleteService } from '../../api/athleteService'
import { kineService } from '../../api/kineService'
import { teamService } from '../../api/teamService'
import '../../styles/team-details.css'

export default function TeamDetailsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { teamId } = useParams()
  const [team, setTeam] = useState(location.state?.team ?? null)
  const [teamLoading, setTeamLoading] = useState(!location.state?.team)
  const [teamError, setTeamError] = useState(null)
  const [subcoachNames, setSubcoachNames] = useState([])
  const [subcoachesLoading, setSubcoachesLoading] = useState(true)
  const [subcoachesError, setSubcoachesError] = useState(null)
  const [kineNames, setKineNames] = useState([])
  const [kinesLoading, setKinesLoading] = useState(true)
  const [kinesError, setKinesError] = useState(null)
  const [athletes, setAthletes] = useState([])
  const [athletesLoading, setAthletesLoading] = useState(true)
  const [athletesError, setAthletesError] = useState(null)

  const athletesCount =
    !athletesLoading && !athletesError
      ? athletes.length
      : team?.athletesCount ?? 0

  const mapStatusLabel = (status) => {
    if (status === 'active') {
      return 'Actif'
    }

    if (status === 'pending') {
      return 'À activer'
    }

    return 'Inactif'
  }

  useEffect(() => {
    let cancelled = false

    const loadKinesiologists = async () => {
      const resolvedTeamId = team?.id ?? teamId
      if (!resolvedTeamId) {
        if (!cancelled) {
          setKinesLoading(false)
          setKineNames([])
        }
        return
      }

      setKinesLoading(true)
      setKinesError(null)

      const result = await kineService.getDisplayKinesiologistsByTeamId(resolvedTeamId)

      if (cancelled) {
        return
      }

      if (result.success) {
        setKineNames(result.data.map((item) => item.name))
      } else {
        setKineNames([])
        setKinesError(result.error)
      }

      setKinesLoading(false)
    }

    loadKinesiologists()

    return () => {
      cancelled = true
    }
  }, [team?.id, teamId])

  useEffect(() => {
    let cancelled = false

    const loadTeam = async () => {
      if (location.state?.team) {
        setTeam(location.state.team)
        setTeamLoading(false)
        setTeamError(null)
        return
      }

      if (!teamId) {
        if (!cancelled) {
          setTeam(null)
          setTeamError('Equipe introuvable ou inaccessible avec vos permissions.')
          setTeamLoading(false)
        }
        return
      }

      setTeamLoading(true)
      setTeamError(null)

      const result = await teamService.getDisplayTeamById(teamId)

      if (cancelled) {
        return
      }

      if (result.success) {
        setTeam(result.data)
      } else {
        setTeam(null)
        setTeamError(result.error ?? 'Equipe introuvable ou inaccessible avec vos permissions.')
      }

      setTeamLoading(false)
    }

    loadTeam()

    return () => {
      cancelled = true
    }
  }, [teamId, location.state])

  useEffect(() => {
    let cancelled = false

    const loadSubcoaches = async () => {
      const resolvedTeamId = team?.id ?? teamId
      if (!resolvedTeamId) {
        if (!cancelled) {
          setSubcoachesLoading(false)
          setSubcoachNames([])
        }
        return
      }

      setSubcoachesLoading(true)
      setSubcoachesError(null)

      const result = await teamService.getSubcoachesByTeamId(resolvedTeamId)

      if (cancelled) {
        return
      }

      if (result.success) {
        const names = result.data
          .map((item) => item?.name)
          .filter((name) => typeof name === 'string' && name.trim() !== '')

        setSubcoachNames(names)
      } else {
        setSubcoachNames([])
        setSubcoachesError(result.error)
      }

      setSubcoachesLoading(false)
    }

    loadSubcoaches()

    return () => {
      cancelled = true
    }
  }, [team?.id, teamId])

  useEffect(() => {
    let cancelled = false

    const loadAthletes = async () => {
      const resolvedTeamId = team?.id ?? teamId
      if (!resolvedTeamId) {
        if (!cancelled) {
          setAthletesLoading(false)
          setAthletes([])
        }
        return
      }

      setAthletesLoading(true)
      setAthletesError(null)


      //get the acces level of the current user, if he is a coach call getDisplayAthleteAll, since the getDisplayAthletesByTeam is only for admins
      const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || 'null')
      const userAccessLevel = Number(
        currentUser?.accessLevel ?? currentUser?.access_level ?? 0
      )
      const isAdmin = userAccessLevel === 1

      let result
      if (isAdmin) {
        result = await athleteService.getDisplayAthletesByTeam(resolvedTeamId)
      } else {
        result = await athleteService.getDisplayAthletes()

        if (result.success) {
          result.data = result.data.filter((athlete) =>
            Array.isArray(athlete.teamIds) &&
            athlete.teamIds.map((id) => String(id)).includes(String(resolvedTeamId)),
          )
        }
      }

      if (cancelled) {
        return
      }

      if (result.success) {
        const rows = result.data.map((athlete) => ({
          id: athlete.id,
          name: athlete.fullName || athlete.username || '—',
          position:
            Array.isArray(athlete.positions) && athlete.positions.length > 0
              ? athlete.positions.join(', ')
              : '—',
          status: mapStatusLabel(athlete.status),
        }))

        setAthletes(rows)
      } else {
        setAthletes([])
        setAthletesError(result.error)
      }

      setAthletesLoading(false)
    }

    loadAthletes()

    return () => {
      cancelled = true
    }
  }, [team?.id, teamId])

  if (teamLoading) {
    return (
      <section className="team-details-page">
        <div className="list-empty">Chargement de la fiche equipe...</div>
      </section>
    )
  }

  if (teamError && !team) {
    return (
      <section className="team-details-page">
        <div className="list-empty">
          {teamError}
        </div>

        <div className="team-details-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate('/equipes')}
          >
            Retour
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="team-details-page">
      <p className="team-details-page__subtitle">Consultez les informations de l&apos;équipe et les athlètes associés.</p>

      <article className="team-details-card">
        <section className="team-details-section">
          <h2>Informations générales</h2>
          <div className="team-details-grid team-details-grid--three">
            <div>
              <p className="team-details-label">Nom de l&apos;équipe</p>
              <p className="team-details-value">{teamLoading ? 'Chargement...' : team?.name ?? '—'}</p>
            </div>
            <div>
              <p className="team-details-label">Sport</p>
              <p className="team-details-value">{teamLoading ? 'Chargement...' : team?.sport ?? '—'}</p>
            </div>
            <div>
              <p className="team-details-label">Nombre d&apos;athlètes associés</p>
              <p className="team-details-value">{athletesCount}</p>
            </div>
          </div>
        </section>

        <section className="team-details-section">
          <h2>Encadrement</h2>
          <div className="team-details-grid team-details-grid--three">
            <div>
              <p className="team-details-label">Coach principal</p>
              <p className="team-details-value">{teamLoading ? 'Chargement...' : team?.headCoach ?? '—'}</p>
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
              {teamError ? <p className="team-details-value">{teamError}</p> : null}
            </div>
            <div>
              <p className="team-details-label">Kiné(s)</p>
              <div className="team-details-chips">
                {kinesLoading ? (
                  <span className="team-details-value">Chargement...</span>
                ) : kinesError ? (
                  <span className="team-details-value">{kinesError}</span>
                ) : kineNames.length > 0 ? (
                  kineNames.map((name) => (
                    <span key={name} className="team-details-chip">{name}</span>
                  ))
                ) : (
                  <span className="team-details-value">—</span>
                )}
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
                {athletesLoading ? (
                  <tr>
                    <td colSpan="4" className="list-empty">Chargement des athlètes...</td>
                  </tr>
                ) : athletesError ? (
                  <tr>
                    <td colSpan="4" className="list-empty">{athletesError}</td>
                  </tr>
                ) : athletes.length > 0 ? (
                  athletes.map((athlete) => (
                    <tr key={athlete.id}>
                      <td className="cell--name">{athlete.name}</td>
                      <td>{athlete.position}</td>
                      <td>
                        <span className={`team-details-status ${athlete.status === 'Actif' ? 'team-details-status--active' : 'team-details-status--inactive'}`}>
                          {athlete.status}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="team-details-profile-btn"
                          onClick={() => navigate(`/athletes/${athlete.id}`)}
                          disabled={!athlete.id}
                        >
                          Voir le profil
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="list-empty">Aucun athlète associé à cette équipe.</td>
                  </tr>
                )}
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
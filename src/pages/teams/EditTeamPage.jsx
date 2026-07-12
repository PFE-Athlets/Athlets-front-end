import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import api from '../../api/config'
import '../../styles/page-form.css'
import '../../styles/create-team.css'
import { TEAM_ROWS } from './teamData'

export default function EditTeamPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { teamId } = useParams()

  const team = useMemo(() => {
    if (location.state?.team) {
      return location.state.team
    }

    return TEAM_ROWS.find((item) => String(item.id) === String(teamId)) ?? TEAM_ROWS[0]
  }, [teamId, location.state])

  const coachOptions = useMemo(() => {
    const unique = [...new Set(TEAM_ROWS.map((item) => item.headCoach).filter(Boolean))]
    if (!unique.includes(team.headCoach)) {
      unique.unshift(team.headCoach)
    }
    return unique
  }, [team.headCoach])

  const [teamName, setTeamName] = useState(team.name)
  const [headCoach, setHeadCoach] = useState(team.headCoach)
  const [subcoachOptions, setSubcoachOptions] = useState([])
  const [selectedSubcoachIds, setSelectedSubcoachIds] = useState([])
  const [subcoachesLoading, setSubcoachesLoading] = useState(true)
  const [subcoachesError, setSubcoachesError] = useState(null)

  useEffect(() => {
    let cancelled = false

    const loadSubcoaches = async () => {
      setSubcoachesLoading(true)
      setSubcoachesError(null)

      try {
        const response = await api.get(`/api/team/subcoaches/${team.id}`)
        const options = Array.isArray(response.data)
          ? response.data
              .filter((item) => item?.coachId != null)
              .map((item) => ({
                id: String(item.coachId),
                name: item.subcoachName ?? 'Coach secondaire',
              }))
          : []

        if (!cancelled) {
          setSubcoachOptions(options)
          setSelectedSubcoachIds(options.map((option) => option.id))
        }
      } catch {
        if (!cancelled) {
          setSubcoachOptions([])
          setSelectedSubcoachIds([])
          setSubcoachesError('Impossible de charger les coachs secondaires.')
        }
      } finally {
        if (!cancelled) {
          setSubcoachesLoading(false)
        }
      }
    }

    loadSubcoaches()

    return () => {
      cancelled = true
    }
  }, [team.id])

  const selectedSubcoaches = useMemo(
    () => subcoachOptions.filter((option) => selectedSubcoachIds.includes(option.id)),
    [subcoachOptions, selectedSubcoachIds],
  )

  const availableSubcoaches = useMemo(
    () => subcoachOptions.filter((option) => !selectedSubcoachIds.includes(option.id)),
    [subcoachOptions, selectedSubcoachIds],
  )

  const handleSubmit = (event) => {
    event.preventDefault()

    navigate('/equipes')
  }

  return (
    <div className="create-page create-team-page">
      <form className="entity-form" onSubmit={handleSubmit}>
        <section className="form-section">
          <h2>Informations générales</h2>

          <div className="form-grid">
            <div className="form-field">
              <label>Nom de l&apos;équipe</label>
              <input
                type="text"
                placeholder="Ex. : Les Dynamiques"
                value={teamName}
                onChange={(event) => setTeamName(event.target.value)}
              />
            </div>

            <div className="form-field">
              <label>Sport</label>
              <select value={team.sport} disabled>
                <option value={team.sport}>{team.sport}</option>
              </select>
            </div>
          </div>
        </section>

        <section className="form-section">
          <h2>Encadrement</h2>

          <div className="form-grid form-grid--single">
            <div className="form-field full-width">
              <label>Coach principal</label>
              <select value={headCoach} onChange={(event) => setHeadCoach(event.target.value)}>
                {coachOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div className="form-field full-width">
              <label>Coach(s) secondaire(s)</label>
              <div className="token-select" role="group" aria-label="Coachs secondaires sélectionnés">
                <div className="token-select__chips">
                  {subcoachesLoading ? (
                    <span className="selection-chip selection-chip--placeholder">Chargement...</span>
                  ) : selectedSubcoaches.length === 0 ? (
                    <span className="selection-chip selection-chip--placeholder">Aucun coach secondaire</span>
                  ) : (
                    selectedSubcoaches.map((coach) => (
                      <span key={coach.id} className="selection-chip">
                        <span>{coach.name}</span>
                        <button
                          type="button"
                          className="selection-chip__remove"
                          onClick={() => setSelectedSubcoachIds((prev) => prev.filter((id) => id !== coach.id))}
                          aria-label={`Retirer ${coach.name}`}
                        >
                          ×
                        </button>
                      </span>
                    ))
                  )}
                </div>

                <select
                  className="token-select__add"
                  value=""
                  onChange={(event) => {
                    const nextId = event.target.value
                    if (!nextId) {
                      return
                    }

                    setSelectedSubcoachIds((prev) => (prev.includes(nextId) ? prev : [...prev, nextId]))
                  }}
                  disabled={subcoachesLoading || availableSubcoaches.length === 0}
                >
                  <option value="">
                    {subcoachesLoading
                      ? 'Chargement...'
                      : availableSubcoaches.length === 0
                        ? 'Aucun coach à ajouter'
                        : 'Ajouter un coach'}
                  </option>
                  {availableSubcoaches.map((coach) => (
                    <option key={coach.id} value={coach.id}>{coach.name}</option>
                  ))}
                </select>
              </div>
              {subcoachesError ? <p className="form-field__error">{subcoachesError}</p> : null}
            </div>
          </div>
        </section>

        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate(-1)}
          >
            Annuler
          </button>

          <button type="submit" className="btn-primary">
            Enregistrer les modifications
          </button>
        </div>
      </form>
    </div>
  )
}

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

  const [teamName, setTeamName] = useState(team.name)
  const [headCoachId, setHeadCoachId] = useState(team.headCoachId ? String(team.headCoachId) : '')
  const [coachOptions, setCoachOptions] = useState([])
  const [coachesLoading, setCoachesLoading] = useState(true)
  const [coachesError, setCoachesError] = useState(null)
  const [subcoachOptions, setSubcoachOptions] = useState([])
  const [selectedSubcoachIds, setSelectedSubcoachIds] = useState([])
  const [subcoachesLoading, setSubcoachesLoading] = useState(true)
  const [subcoachesError, setSubcoachesError] = useState(null)
  const [submitError, setSubmitError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false

    const loadCoaches = async () => {
      setCoachesLoading(true)
      setCoachesError(null)

      try {
        const response = await api.get('/api/coach/coaches')
        const options = Array.isArray(response.data)
          ? response.data
              .filter((item) => item?.coachId != null)
              .map((item) => ({
                id: String(item.coachId),
                name: item.coachName ?? 'Coach',
              }))
          : []

        if (!cancelled) {
          setCoachOptions(options)
          setSubcoachOptions(options)

          if (team.headCoachId) {
            setHeadCoachId(String(team.headCoachId))
          } else {
            const matched = options.find((option) => option.name === team.headCoach)
            setHeadCoachId(matched?.id ?? '')
          }
        }
      } catch {
        if (!cancelled) {
          setCoachOptions([])
          setSubcoachOptions([])
          setHeadCoachId('')
          setCoachesError('Impossible de charger la liste des coachs.')
        }
      } finally {
        if (!cancelled) {
          setCoachesLoading(false)
        }
      }
    }

    loadCoaches()

    return () => {
      cancelled = true
    }
  }, [team.headCoach])

  useEffect(() => {
    let cancelled = false

    const loadSubcoaches = async () => {
      setSubcoachesLoading(true)
      setSubcoachesError(null)

      try {
        const response = await api.get(`/api/team/subcoaches/${team.id}`)
        const ids = Array.isArray(response.data)
          ? response.data
              .filter((item) => item?.coachId != null)
              .map((item) => String(item.coachId))
          : []

        if (!cancelled) {
          setSelectedSubcoachIds(ids)
        }
      } catch {
        if (!cancelled) {
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

  useEffect(() => {
    if (!headCoachId) {
      return
    }

    setSelectedSubcoachIds((prev) => prev.filter((id) => id !== headCoachId))
  }, [headCoachId])

  const selectedSubcoaches = useMemo(
    () => subcoachOptions.filter((option) => selectedSubcoachIds.includes(option.id)),
    [subcoachOptions, selectedSubcoachIds],
  )

  const availableSubcoaches = useMemo(
    () => subcoachOptions.filter((option) => !selectedSubcoachIds.includes(option.id) && option.id !== headCoachId),
    [subcoachOptions, selectedSubcoachIds, headCoachId],
  )

  const handleSubmit = async (event) => {
    event.preventDefault()

    setSubmitError(null)

    if (!headCoachId) {
      setSubmitError('Veuillez sélectionner un coach principal.')
      return
    }

    if (selectedSubcoachIds.includes(headCoachId)) {
      setSubmitError('Le coach principal ne peut pas être aussi coach secondaire.')
      return
    }

    setSubmitting(true)

    try {
      await api.patch(`/api/team/modify/${team.id ?? teamId}`, {
        teamId: Number(team.id ?? teamId),
        newTeamName: teamName.trim(),
        newCoachId: Number(headCoachId),
        newSubcoachesIds: selectedSubcoachIds.map((id) => Number(id)),
      })

      navigate('/equipes')
    } catch (error) {
      const data = error.response?.data
      const message = typeof data === 'string' ? data : data?.message
      setSubmitError(message ?? 'Impossible de modifier cette équipe.')
    } finally {
      setSubmitting(false)
    }
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
              <select
                value={headCoachId}
                onChange={(event) => setHeadCoachId(event.target.value)}
                disabled={coachesLoading || coachOptions.length === 0}
              >
                <option value="">Sélectionner un coach principal</option>
                {coachOptions.map((option) => (
                  <option key={option.id} value={option.id}>{option.name}</option>
                ))}
              </select>
              {coachesError ? <p className="form-field__error">{coachesError}</p> : null}
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

          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </div>
        {submitError ? <p className="form-field__error">{submitError}</p> : null}
      </form>
    </div>
  )
}

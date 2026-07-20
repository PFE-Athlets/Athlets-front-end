import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/config'
import '../../styles/page-form.css'
import '../../styles/create-team.css'

export default function CreateTeamPage() {
  const navigate = useNavigate()
  const [teamName, setTeamName] = useState('')
  const [sport, setSport] = useState('')
  const [sportOptions, setSportOptions] = useState([])
  const [sportsLoading, setSportsLoading] = useState(true)
  const [sportsError, setSportsError] = useState(null)
  const [headCoachId, setHeadCoachId] = useState('')
  const [coachOptions, setCoachOptions] = useState([])
  const [coachesLoading, setCoachesLoading] = useState(true)
  const [coachesError, setCoachesError] = useState(null)
  const [selectedSubcoachIds, setSelectedSubcoachIds] = useState([])
  const [submitError, setSubmitError] = useState(null)
  const [submitSuccess, setSubmitSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false

    const loadSports = async () => {
      setSportsLoading(true)
      setSportsError(null)

      try {
        const response = await api.get('/api/sport/sports')
        const options = Array.isArray(response.data)
          ? response.data
              .filter((item) => item?.sportId != null)
              .map((item) => ({
                id: String(item.sportId),
                name: item.sportName ?? 'Sport',
              }))
          : []

        if (!cancelled) {
          setSportOptions(options)
        }
      } catch {
        if (!cancelled) {
          setSportOptions([])
          setSportsError('Impossible de charger la liste des sports.')
        }
      } finally {
        if (!cancelled) {
          setSportsLoading(false)
        }
      }
    }

    loadSports()

    return () => {
      cancelled = true
    }
  }, [])

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
        }
      } catch {
        if (!cancelled) {
          setCoachOptions([])
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
  }, [])

  useEffect(() => {
    if (!headCoachId) {
      return
    }

    setSelectedSubcoachIds((prev) => prev.filter((id) => id !== headCoachId))
  }, [headCoachId])

  const selectedSubcoaches = useMemo(
    () => coachOptions.filter((option) => selectedSubcoachIds.includes(option.id)),
    [coachOptions, selectedSubcoachIds],
  )

  const availableSubcoaches = useMemo(
    () => coachOptions.filter((option) => !selectedSubcoachIds.includes(option.id) && option.id !== headCoachId),
    [coachOptions, selectedSubcoachIds, headCoachId],
  )

  const isSubmitLocked = submitting || Boolean(submitSuccess)

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (submitSuccess) {
      return
    }

    setSubmitError(null)
    setSubmitSuccess('')

    const trimmedTeamName = teamName.trim()
    if (!trimmedTeamName) {
      setSubmitError('Veuillez saisir un nom d\'équipe.')
      return
    }

    if (!sport) {
      setSubmitError('Veuillez sélectionner un sport.')
      return
    }

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
      await api.post('/api/team', {
        teamName: trimmedTeamName,
        sportId: Number(sport),
        headCoachId: Number(headCoachId),
        subcoachIds: selectedSubcoachIds.map((id) => Number(id)),
      })
      setSubmitSuccess('Équipe créée avec succès.')
    } catch (error) {
      const data = error.response?.data
      const message = typeof data === 'string' ? data : data?.message
      setSubmitError(message ?? 'Impossible de créer cette équipe.')
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
              <select
                value={sport}
                onChange={(event) => setSport(event.target.value)}
                disabled={sportsLoading || sportOptions.length === 0}
              >
                <option value="">Sélectionner un sport</option>
                {sportOptions.map((option) => (
                  <option key={option.id} value={option.id}>{option.name}</option>
                ))}
              </select>
              {sportsError ? <p className="form-field__error">{sportsError}</p> : null}
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
                  {coachesLoading ? (
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
                  disabled={coachesLoading || availableSubcoaches.length === 0}
                >
                  <option value="">
                    {coachesLoading
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
              {coachesError ? <p className="form-field__error">{coachesError}</p> : null}
            </div>

            <div className="form-field full-width">
              <label>Kiné(s)</label>
              <div className="token-select" role="group" aria-label="Kinés sélectionnés">
                <div className="token-select__chips">
                  <span className="selection-chip selection-chip--placeholder">TODO: brancher la gestion des kinés</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate(-1)}
            disabled={isSubmitLocked}
          >
            Annuler
          </button>

          <button type="submit" className="btn-primary" disabled={isSubmitLocked}>
            {submitting ? 'Création...' : 'Créer l\'équipe'}
          </button>
        </div>
        {submitError ? <p className="form-field__error">{submitError}</p> : null}
        {submitSuccess ? (
          <section className="success-section" role="status" aria-live="polite">
            <div className="success-section__content">
              <span className="success-section__icon" aria-hidden="true">✓</span>
              <div>
                <h2>Succès</h2>
                <p>{submitSuccess}</p>
              </div>
            </div>

            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate('/equipes')}
            >
              Retour à la liste des équipes
            </button>
          </section>
        ) : null}
      </form>
    </div>
  )
}
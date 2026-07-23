import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../../styles/page-form.css'
import '../../styles/create-team.css'
import '../../styles/page-view.css'
import '../../styles/team-details.css'
import { kineService } from '../../api/kineService'
import { teamService } from '../../api/teamService'

export default function CreateTeamPage({ canCreateTeam = false }) {
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
  const [kineOptions, setKineOptions] = useState([])
  const [kinesLoading, setKinesLoading] = useState(true)
  const [kinesError, setKinesError] = useState(null)
  const [selectedSubcoachIds, setSelectedSubcoachIds] = useState([])
  const [selectedKineIds, setSelectedKineIds] = useState([])
  const [submitError, setSubmitError] = useState(null)
  const [submitSuccess, setSubmitSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false

    const loadSports = async () => {
      setSportsLoading(true)
      setSportsError(null)

      const result = await teamService.getSportOptions()

      if (cancelled) {
        return
      }

      if (result.success) {
        setSportOptions(result.data)
      } else {
        setSportOptions([])
        setSportsError(result.error)
      }

      setSportsLoading(false)
    }

    loadSports()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    const loadKinesiologists = async () => {
      setKinesLoading(true)
      setKinesError(null)

      const result = await kineService.getDisplayKinesiologists()

      if (cancelled) {
        return
      }

      if (result.success) {
        setKineOptions(result.data)
      } else {
        setKineOptions([])
        setKinesError(result.error)
      }

      setKinesLoading(false)
    }

    loadKinesiologists()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    const loadCoaches = async () => {
      setCoachesLoading(true)
      setCoachesError(null)

      const result = await teamService.getCoachOptions()

      if (cancelled) {
        return
      }

      if (result.success) {
        setCoachOptions(result.data)
      } else {
        setCoachOptions([])
        setCoachesError(result.error)
      }

      setCoachesLoading(false)
    }

    loadCoaches()

    return () => {
      cancelled = true
    }
  }, [])

  const selectedSubcoaches = useMemo(
    () => coachOptions.filter((option) => selectedSubcoachIds.includes(option.id)),
    [coachOptions, selectedSubcoachIds],
  )

  const availableSubcoaches = useMemo(
    () => coachOptions.filter((option) => !selectedSubcoachIds.includes(option.id) && option.id !== headCoachId),
    [coachOptions, selectedSubcoachIds, headCoachId],
  )

  const selectedKines = useMemo(
    () => kineOptions.filter((option) => selectedKineIds.includes(option.id)),
    [kineOptions, selectedKineIds],
  )

  const availableKines = useMemo(
    () => kineOptions.filter((option) => !selectedKineIds.includes(option.id)),
    [kineOptions, selectedKineIds],
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

    const result = await teamService.createTeam({
      teamName: trimmedTeamName,
      sportId: Number(sport),
      headCoachId: Number(headCoachId),
      subcoachIds: selectedSubcoachIds.map((id) => Number(id)),
      kineIds: selectedKineIds.map((id) => Number(id)),
    })

    if (result.success) {
      setSubmitSuccess('Équipe créée avec succès.')
    } else {
      setSubmitError(result.error)
    }

    setSubmitting(false)
  }

  if (!canCreateTeam) {
    return (
      <section className="team-details-page">
        <div className="list-empty">Accès refusé. Vous ne pouvez pas créer d'équipe.</div>
        <div className="team-details-actions">
          <button type="button" className="btn-secondary" onClick={() => navigate('/equipes')}>
            Retour
          </button>
        </div>
      </section>
    )
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
                onChange={(event) => {
                  const nextHeadCoachId = event.target.value
                  setHeadCoachId(nextHeadCoachId)
                  setSelectedSubcoachIds((prev) => prev.filter((id) => id !== nextHeadCoachId))
                }}
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
                  {kinesLoading ? (
                    <span className="selection-chip selection-chip--placeholder">Chargement...</span>
                  ) : selectedKines.length === 0 ? (
                    <span className="selection-chip selection-chip--placeholder">Aucun kiné</span>
                  ) : (
                    selectedKines.map((kine) => (
                      <span key={kine.id} className="selection-chip">
                        <span>{kine.name}</span>
                        <button
                          type="button"
                          className="selection-chip__remove"
                          onClick={() => setSelectedKineIds((prev) => prev.filter((id) => id !== kine.id))}
                          aria-label={`Retirer ${kine.name}`}
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

                    setSelectedKineIds((prev) => (prev.includes(nextId) ? prev : [...prev, nextId]))
                  }}
                  disabled={kinesLoading || availableKines.length === 0}
                >
                  <option value="">
                    {kinesLoading
                      ? 'Chargement...'
                      : availableKines.length === 0
                        ? 'Aucun kiné à ajouter'
                        : 'Ajouter un kiné'}
                  </option>
                  {availableKines.map((kine) => (
                    <option key={kine.id} value={kine.id}>{kine.name}</option>
                  ))}
                </select>
              </div>
              {kinesError ? <p className="form-field__error">{kinesError}</p> : null}
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
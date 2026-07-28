import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import '../../styles/page-form.css'
import '../../styles/create-team.css'
import '../../styles/page-view.css'
import '../../styles/team-details.css'
import { kineService } from '../../api/kineService'
import { teamService } from '../../api/teamService'

export default function EditTeamPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { teamId } = useParams()

  const [team, setTeam] = useState(location.state?.team ?? null)
  const [teamLoading, setTeamLoading] = useState(!location.state?.team)
  const [teamError, setTeamError] = useState(null)

  const [teamName, setTeamName] = useState(location.state?.team?.name ?? '')
  const [headCoachId, setHeadCoachId] = useState(
    location.state?.team?.headCoachId ? String(location.state.team.headCoachId) : '',
  )

  const [coachOptions, setCoachOptions] = useState([])
  const [coachesLoading, setCoachesLoading] = useState(true)
  const [coachesError, setCoachesError] = useState(null)

  const [kineOptions, setKineOptions] = useState([])
  const [kinesLoading, setKinesLoading] = useState(true)
  const [kinesError, setKinesError] = useState(null)

  const [subcoachOptions, setSubcoachOptions] = useState([])
  const [selectedSubcoachIds, setSelectedSubcoachIds] = useState([])
  const [subcoachesLoading, setSubcoachesLoading] = useState(true)
  const [subcoachesError, setSubcoachesError] = useState(null)

  const [selectedKineIds, setSelectedKineIds] = useState([])
  const [submitError, setSubmitError] = useState(null)
  const [submitSuccess, setSubmitSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false

    const loadTeam = async () => {
      if (location.state?.team) {
        const initialTeam = location.state.team
        setTeam(initialTeam)
        setTeamName(initialTeam?.name ?? '')
        setHeadCoachId(initialTeam?.headCoachId ? String(initialTeam.headCoachId) : '')
        setTeamError(null)
        setTeamLoading(false)
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
        setTeamName(result.data?.name ?? '')
        setHeadCoachId(result.data?.headCoachId ? String(result.data.headCoachId) : '')
      } else {
        setTeam(null)
        setTeamError(result.error)
      }

      setTeamLoading(false)
    }

    if (teamId) {
      loadTeam()
    }

    return () => {
      cancelled = true
    }
  }, [teamId, location.state])

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
        const options = result.data
        setCoachOptions(options)
        setSubcoachOptions(options)

        if (team?.headCoachId) {
          setHeadCoachId(String(team.headCoachId))
        } else {
          const matched = options.find((option) => option.name === team?.headCoach)
          setHeadCoachId(matched?.id ?? '')
        }
      } else {
        setCoachOptions([])
        setSubcoachOptions([])
        setHeadCoachId('')
        setCoachesError(result.error)
      }

      setCoachesLoading(false)
    }

    loadCoaches()

    return () => {
      cancelled = true
    }
  }, [team?.headCoach, team?.headCoachId])

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

    const loadSubcoaches = async () => {
      if (!team?.id) {
        setSubcoachesLoading(false)
        setSelectedSubcoachIds([])
        return
      }

      setSubcoachesLoading(true)
      setSubcoachesError(null)

      const result = await teamService.getSubcoachesByTeamId(team?.id)

      if (cancelled) {
        return
      }

      if (result.success) {
        const ids = result.data.map((item) => String(item.id))
        setSelectedSubcoachIds(ids)
      } else {
        setSelectedSubcoachIds([])
        setSubcoachesError(result.error)
      }

      setSubcoachesLoading(false)
    }

    loadSubcoaches()

    return () => {
      cancelled = true
    }
  }, [team?.id])

  useEffect(() => {
    let cancelled = false

    const loadKinesiologistsByTeam = async () => {
      setKinesError(null)

      const resolvedTeamId = team?.id ?? teamId
      if (!resolvedTeamId) {
        if (!cancelled) {
          setSelectedKineIds([])
        }
        return
      }

      const result = await kineService.getDisplayKinesiologistsByTeamId(resolvedTeamId)

      if (cancelled) {
        return
      }

      if (result.success) {
        const ids = (result.data ?? [])
          .map((item) => String(item.id))
          .filter((id) => id !== '')

        setSelectedKineIds(ids)
      } else {
        setSelectedKineIds([])
        setKinesError(result.error ?? 'Impossible de charger les kinés de cette équipe.')
      }
    }

    loadKinesiologistsByTeam()

    return () => {
      cancelled = true
    }
  }, [team?.id, teamId])

  const selectedSubcoaches = useMemo(
    () => subcoachOptions.filter((option) => selectedSubcoachIds.includes(option.id)),
    [subcoachOptions, selectedSubcoachIds],
  )

  const availableSubcoaches = useMemo(
    () => subcoachOptions.filter((option) => !selectedSubcoachIds.includes(option.id) && option.id !== headCoachId),
    [subcoachOptions, selectedSubcoachIds, headCoachId],
  )

  const selectedKines = useMemo(
    () => kineOptions.filter((option) => selectedKineIds.includes(option.id)),
    [kineOptions, selectedKineIds],
  )

  const availableKines = useMemo(
    () => kineOptions.filter((option) => !selectedKineIds.includes(option.id)),
    [kineOptions, selectedKineIds],
  )

  const isLockedAfterSave = Boolean(submitSuccess)

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (isLockedAfterSave) {
      return
    }

    setSubmitError(null)
    setSubmitSuccess('')

    if (!headCoachId) {
      setSubmitError('Veuillez sélectionner un coach principal.')
      return
    }

    if (selectedSubcoachIds.includes(headCoachId)) {
      setSubmitError('Le coach principal ne peut pas être aussi coach secondaire.')
      return
    }

    setSubmitting(true)

    const result = await teamService.modifyTeam(team?.id ?? teamId, {
      teamId: Number(team?.id ?? teamId),
      newTeamName: teamName.trim(),
      newCoachId: Number(headCoachId),
      newSubcoachesIds: selectedSubcoachIds.map((id) => Number(id)),
      newKinesiologistsIds: selectedKineIds.map((id) => Number(id)),
    })

    if (result.success) {
      setSubmitSuccess('Modifications enregistrées avec succès.')
    } else {
      setSubmitError(result.error)
    }

    setSubmitting(false)
  }

  if (teamLoading) {
    return <div className="create-page create-team-page">Chargement de l&apos;équipe...</div>
  }

  if (teamError && !team) {
    return (
      <section className="team-details-page">
        <div className="list-empty">{teamError}</div>
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
              <select value={team?.sport ?? '—'} disabled>
                <option value={team?.sport ?? '—'}>{team?.sport ?? '—'}</option>
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
            disabled={submitting || isLockedAfterSave}
          >
            Annuler
          </button>

          <button type="submit" className="btn-primary" disabled={submitting || isLockedAfterSave}>
            {submitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
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

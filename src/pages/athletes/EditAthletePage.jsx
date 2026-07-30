import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { authService } from '../../api/authService'
import { athleteService } from '../../api/athleteService'
import { teamService } from '../../api/teamService'
import '../../styles/page-form.css'

import {
  formatDate,
  formatGender,
  formatDominantSide,
} from '../../utils/athleteFormatters'

const EMPTY_FORM = {
  firstName: '',
  lastName: '',
  birthDate: '',
  gender: '',
  email: '',
  username: '',
  accountStatus: '',
  phone: '',
  weightKg: '',
  heightMeters: '',
  dominantArm: '',
  dominantLeg: '',
  injuryHistory: '',
  athleteTeamId: '',
  athletePositionId: '',
  athleteDisciplineId: '',
  teamIds: [],
  positionIds: [],
  disciplineIds: [],
}

const STATUS_LABELS = {
  Active: 'Actif',
  Pending: 'En attente',
  Inactive: 'Non actif',
}

export default function EditAthletePage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [form, setForm] = useState(EMPTY_FORM)

  const [teams, setTeams] = useState([])
  const [athleteTeams, setAthleteTeams] = useState([])
  const [athletePositions, setAthletePositions] = useState([])
  const [athleteDisciplines, setAthleteDisciplines] = useState([])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deactivating, setDeactivating] = useState(false)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  useEffect(() => {
    const loadPage = async () => {
      setLoading(true)
      setError('')

      const [athleteResult, teamsResult] = await Promise.all([
        athleteService.getAthleteById(id),
        teamService.getDisplayTeams(),
      ])

      if (!athleteResult.success) {
        console.error(
          'Erreur lors du chargement du profil athlète :',
          athleteResult.error,
        )

        setError(
          athleteResult.error ||
            'Une erreur est survenue lors du chargement.',
        )

        setLoading(false)
        return
      }

      const athlete = athleteResult.data

      const currentTeams = Array.isArray(athlete.teams)
        ? athlete.teams
        : []

      const currentPositions = Array.isArray(athlete.positions)
        ? athlete.positions
        : []

      setAthleteTeams(currentTeams)
      setAthletePositions(currentPositions)
      setAthleteDisciplines([])

      if (teamsResult.success) {
        setTeams(teamsResult.data)
      } else {
        console.error(
          'Erreur lors du chargement des équipes :',
          teamsResult.error,
        )

        setTeams([])
      }

      setForm({
        firstName: athlete.authUser?.firstName ?? '',
        lastName: athlete.authUser?.lastName ?? '',
        birthDate: athlete.birthDate ?? '',
        gender: athlete.gender ?? '',
        email: athlete.authUser?.email ?? '',
        username: athlete.authUser?.username ?? '',
        accountStatus:
          athlete.authUser?.accountStatus ?? '',
        phone: athlete.authUser?.phone ?? '',
        weightKg: athlete.weightKg ?? '',
        heightMeters: athlete.heightMeters ?? '',
        dominantArm: athlete.dominantArm ?? '',
        dominantLeg: athlete.dominantLeg ?? '',
        injuryHistory: athlete.injuryHistory ?? '',

        athleteTeamId:
          currentTeams.length > 0
            ? String(currentTeams[0].id)
            : '',

        athletePositionId:
          currentPositions.length > 0
            ? String(currentPositions[0].id)
            : '',

        athleteDisciplineId:
          '',

        teamIds: currentTeams
          .map((team) => Number(team.id))
          .filter((teamId) => !Number.isNaN(teamId)),

        positionIds: currentPositions
          .map((position) => Number(position.id))
          .filter(
            (positionId) => !Number.isNaN(positionId),
          ),

        disciplineIds: [],
      })

      setLoading(false)
    }

    loadPage()
  }, [id])

  const selectedTeamNames = useMemo(() => {
    const teamSource =
      teams.length > 0 ? teams : athleteTeams

    if (form.athleteTeamId) {
      const selectedTeam = teamSource.find(
        (team) =>
          String(team.id) ===
          String(form.athleteTeamId),
      )

      return selectedTeam
        ? [selectedTeam.name]
        : []
    }

    return teamSource
      .filter((team) =>
        form.teamIds.includes(Number(team.id)),
      )
      .map((team) => team.name)
  }, [
    athleteTeams,
    form.athleteTeamId,
    form.teamIds,
    teams,
  ])

  const normalizedStatus =
    form.accountStatus?.trim().toUpperCase()

  const isInactive = normalizedStatus === 'INACTIVE'

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))

    setFieldErrors((current) => ({
      ...current,
      [field]: '',
    }))

    setSuccess('')
  }

  const validate = () => {
    const errors = {}

    if (
      form.phone &&
      !/^[+()\d\s.-]{7,25}$/.test(form.phone.trim())
    ) {
      errors.phone =
        'Le numéro de téléphone est invalide.'
    }

    if (
      form.weightKg === '' ||
      Number.isNaN(Number(form.weightKg)) ||
      Number(form.weightKg) <= 0 ||
      Number(form.weightKg) > 500
    ) {
      errors.weightKg =
        'Le poids doit être un nombre supérieur à 0 et inférieur ou égal à 500 kg.'
    }

    if (!form.athleteTeamId && form.teamIds.length === 0) {
      errors.teamIds =
        'L’athlète doit être associé à au moins une équipe.'
    }

    setFieldErrors(errors)

    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!validate()) {
      setSuccess('')
      setError(
        'Veuillez corriger les erreurs du formulaire.',
      )
      return
    }

    const confirmed = window.confirm(
      'Voulez-vous vraiment enregistrer les modifications du profil athlète?',
    )

    if (!confirmed) {
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')

    const result =
      await athleteService.updateAthlete(id, form)

    if (!result.success) {
      console.error(
        'Erreur lors de la modification de l’athlète :',
        result.error,
      )

      setError(
        result.error ||
          'Une erreur est survenue pendant la modification.',
      )

      setSaving(false)
      return
    }

    setSuccess(
      result.message ||
        'Le profil athlète a été modifié avec succès.',
    )

    setSaving(false)
  }

  const handleDeactivate = async () => {
    const confirmed = window.confirm(
      'Voulez-vous vraiment désactiver cet athlète? Il ne pourra plus se connecter.',
    )

    if (!confirmed) {
      return
    }

    setDeactivating(true)
    setError('')
    setSuccess('')

    const result =
      await authService.deactivateAthlete(id)

    if (!result.success) {
      console.error(
        'Erreur lors de la désactivation de l’athlète :',
        result.error,
      )

      setError(
        result.error ||
          'Une erreur est survenue pendant la désactivation.',
      )

      setDeactivating(false)
      return
    }

    setForm((current) => ({
      ...current,
      accountStatus: 'Inactive',
    }))

    setSuccess(
      result.message ||
        'Le compte de l’athlète a été désactivé avec succès.',
    )

    setDeactivating(false)
  }

  if (loading) {
    return (
      <div className="create-page">
        <div className="form-message">
          Chargement du profil athlète...
        </div>
      </div>
    )
  }

  if (error && !form.username) {
    return (
      <div className="create-page">
        <div className="form-message form-message--error">
          {error}
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate('/athletes')}
          >
            Retour à la liste
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="create-page">
      <form
        className="entity-form"
        onSubmit={handleSubmit}
      >
        {success && (
          <div
            className="form-message form-message--success"
            role="status"
          >
            {success}
          </div>
        )}

        {error && (
          <div
            className="form-message form-message--error"
            role="alert"
          >
            {error}
          </div>
        )}

        <section className="form-section">
          <h2>Informations personnelles</h2>

          <div className="form-grid">
            <ReadOnlyField
              label="Prénom"
              value={form.firstName}
            />

            <ReadOnlyField
              label="Nom"
              value={form.lastName}
            />

            <ReadOnlyField
              label="Date de naissance"
              value={form.birthDate}
              type="date"
            />

            <ReadOnlyField
              label="Sexe"
              value={formatGender(form.gender)}
            />

            <div className="form-field full-width">
              <label htmlFor="athlete-email">
                Courriel
              </label>

              <input
                id="athlete-email"
                type="email"
                value={form.email}
                readOnly
                disabled
              />
            </div>

            <div className="form-field full-width">
              <label htmlFor="athlete-phone">
                Téléphone
              </label>

              <input
                id="athlete-phone"
                type="tel"
                value={form.phone}
                placeholder="Ex. : 514 555-1234"
                onChange={(event) =>
                  updateField(
                    'phone',
                    event.target.value,
                  )
                }
                aria-invalid={Boolean(
                  fieldErrors.phone,
                )}
              />

              {fieldErrors.phone && (
                <small className="form-field__error">
                  {fieldErrors.phone}
                </small>
              )}
            </div>
          </div>
        </section>

        <section className="form-section">
          <h2>Profil sportif</h2>

          <div className="form-grid">
            <div className="form-field full-width">
              <label htmlFor="athlete-teams">
                Équipe
              </label>

              {teams.length > 0 ? (
                <select
                  id="athlete-teams"
                  value={form.athleteTeamId}
                  onChange={(event) => {
                    const selectedTeamId =
                      event.target.value

                    updateField(
                      'athleteTeamId',
                      selectedTeamId,
                    )

                    updateField(
                      'teamIds',
                      selectedTeamId
                        ? [Number(selectedTeamId)]
                        : [],
                    )

                    updateField(
                      'athletePositionId',
                      '',
                    )

                    updateField(
                      'positionIds',
                      [],
                    )

                    updateField(
                      'athleteDisciplineId',
                      '',
                    )

                    updateField(
                      'disciplineIds',
                      [],
                    )
                  }}
                  aria-invalid={Boolean(fieldErrors.teamIds)}
                >
                  <option value="" disabled>
                    Sélectionner une équipe
                  </option>

                  {teams.map((team) => (
                    <option
                      key={team.id}
                      value={team.id}
                    >
                      {team.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={
                    selectedTeamNames.join(', ') ||
                    'Aucune équipe'
                  }
                  readOnly
                  disabled
                />
              )}

              {fieldErrors.teamIds && (
                <small className="form-field__error">
                  {fieldErrors.teamIds}
                </small>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="athlete-position-id">
                Position
              </label>

              <select
                id="athlete-position-id"
                value={form.athletePositionId}
                onChange={(event) => {
                  const selectedPositionId =
                    event.target.value

                  updateField(
                    'athletePositionId',
                    selectedPositionId,
                  )

                  updateField(
                    'positionIds',
                    selectedPositionId
                      ? [Number(selectedPositionId)]
                      : [],
                  )
                }}
                disabled={!form.athleteTeamId}
              >
                <option value="">
                  {form.athleteTeamId
                    ? 'En attente des positions backend'
                    : 'Sélectionner une équipe d’abord'}
                </option>

                {athletePositions.map((position) => (
                  <option
                    key={position.id}
                    value={position.id}
                  >
                    {position.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="athlete-discipline-id">
                Discipline
              </label>

              <select
                id="athlete-discipline-id"
                value={form.athleteDisciplineId}
                onChange={(event) => {
                  const selectedDisciplineId =
                    event.target.value

                  updateField(
                    'athleteDisciplineId',
                    selectedDisciplineId,
                  )

                  updateField(
                    'disciplineIds',
                    selectedDisciplineId
                      ? [Number(selectedDisciplineId)]
                      : [],
                  )
                }}
                disabled={!form.athleteTeamId}
              >
                <option value="">
                  {form.athleteTeamId
                    ? 'En attente des disciplines backend'
                    : 'Sélectionner une équipe d’abord'}
                </option>

                {athleteDisciplines.map((discipline) => (
                  <option
                    key={discipline.id}
                    value={discipline.id}
                  >
                    {discipline.name}
                  </option>
                ))}
              </select>
            </div>

            <ReadOnlyField
              label="Taille"
              value={
                form.heightMeters !== ''
                  ? `${form.heightMeters} cm`
                  : ''
              }
            />

            <div className="form-field">
              <label htmlFor="athlete-weight">
                Poids
              </label>

              <input
                id="athlete-weight"
                type="number"
                min="0.1"
                max="500"
                step="0.1"
                value={form.weightKg}
                placeholder="Ex. : 75"
                onChange={(event) =>
                  updateField(
                    'weightKg',
                    event.target.value,
                  )
                }
                aria-invalid={Boolean(
                  fieldErrors.weightKg,
                )}
                required
              />

              {fieldErrors.weightKg && (
                <small className="form-field__error">
                  {fieldErrors.weightKg}
                </small>
              )}
            </div>

            <ReadOnlyField
              label="Bras dominant"
              value={formatDominantSide(
                form.dominantArm,
                false,
              )}
            />

            <ReadOnlyField
              label="Jambe dominante"
              value={formatDominantSide(
                form.dominantLeg,
                true,
              )}
            />
          </div>
        </section>

        <section className="form-section">
          <h2>Compte utilisateur</h2>

          <div className="form-grid form-grid--three">
            <ReadOnlyField
              label="Nom d'utilisateur"
              value={form.username}
            />

            <ReadOnlyField
              label="Statut du compte"
              value={
                STATUS_LABELS[form.accountStatus] ||
                STATUS_LABELS[
                  form.accountStatus
                    ?.trim()
                    .toUpperCase()
                ] ||
                form.accountStatus
              }
            />

            <div className="form-field">
              <label>Permissions</label>

              <input
                type="text"
                value="Gérées par le serveur"
                readOnly
                disabled
              />
            </div>
          </div>
        </section>

        <section className="form-section form-section--notes">
          <h2>Historique médical et notes</h2>

          <div className="form-field full-width">
            <label htmlFor="athlete-injury-history">
              Historique des blessures et notes
            </label>

            <textarea
              id="athlete-injury-history"
              value={form.injuryHistory}
              placeholder="Ex. : Antécédents de blessures, interventions, recommandations particulières..."
              onChange={(event) =>
                updateField(
                  'injuryHistory',
                  event.target.value,
                )
              }
            />
          </div>
        </section>

        <section className="deactivate-section">
          <div className="deactivate-section__content">
            <span
              className="deactivate-section__icon"
              aria-hidden="true"
            >
              ⚠
            </span>

            <div>
              <h2>Désactiver le compte</h2>

              <p>
                La désactivation rendra l’athlète
                inactif. Il ne pourra plus se connecter
                ni apparaître dans les sélections ou les
                rapports.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="btn-danger-outline"
            onClick={handleDeactivate}
            disabled={
              deactivating ||
              saving ||
              isInactive
            }
          >
            {isInactive
              ? 'Compte désactivé'
              : deactivating
                ? 'Désactivation...'
                : 'Désactiver le compte'}
          </button>
        </section>

        {success && (
          <section
            className="success-section"
            role="status"
          >
            <div className="success-section__content">
              <span
                className="success-section__icon"
                aria-hidden="true"
              >
                ✓
              </span>

              <div>
                <h2>Modification enregistrée</h2>

                <p>{success}</p>
              </div>
            </div>
          </section>
        )}

        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate('/athletes')}
            disabled={saving || deactivating}
          >
            Annuler
          </button>

          <button
            type="submit"
            className="btn-primary"
            disabled={saving || deactivating}
          >
            {saving
              ? 'Enregistrement...'
              : 'Enregistrer les modifications'}
          </button>
        </div>
      </form>
    </div>
  )
}

function ReadOnlyField({
  label,
  value,
  type = 'text',
}) {
  return (
    <div className="form-field">
      <label>{label}</label>

      <input
        type={type}
        value={value ?? ''}
        readOnly
        disabled
      />
    </div>
  )
}
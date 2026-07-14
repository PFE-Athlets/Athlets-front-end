import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import '../../styles/page-form.css'

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
  teamIds: [],
  positionIds: [],
  disciplineIds: [],
}

const STATUS_LABELS = {
  ACTIVE: 'Actif',
  A_ACTIVER: 'En attente',
  INACTIVE: 'Non actif',
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
      try {
        setLoading(true)
        setError('')

        const [athletesResponse, teamsResponse] = await Promise.all([
          fetch('http://localhost:8080/api/athlete/all', {
            credentials: 'include',
            headers: {
              Accept: 'application/json',
            },
          }),
          fetch('http://localhost:8080/api/team/teams', {
            credentials: 'include',
            headers: {
              Accept: 'application/json',
            },
          }),
        ])

        if (athletesResponse.status === 401 || teamsResponse.status === 401) {
          throw new Error('Vous devez être connecté.')
        }

        if (athletesResponse.status === 403) {
          throw new Error(
            'Vous n’êtes pas autorisé à modifier ce profil athlète.',
          )
        }

        if (!athletesResponse.ok) {
          throw new Error(
            `Impossible de charger l’athlète. Erreur ${athletesResponse.status}.`,
          )
        }

        const athletesData = await athletesResponse.json()
        const teamsData = teamsResponse.ok ? await teamsResponse.json() : []

        const athlete = Array.isArray(athletesData)
          ? athletesData.find(
              (item) => String(item.authUser?.id) === String(id),
            )
          : null

        if (!athlete) {
          throw new Error(
            'Athlète introuvable ou inaccessible avec vos permissions.',
          )
        }

        const currentTeams = Array.isArray(athlete.teams) ? athlete.teams : []
        const currentPositions = Array.isArray(athlete.positions)
          ? athlete.positions
          : []
        const currentDisciplines = Array.isArray(athlete.disciplines)
          ? athlete.disciplines
          : []

        setTeams(normalizeTeamsResponse(teamsData))
        setAthleteTeams(currentTeams)
        setAthletePositions(currentPositions)
        setAthleteDisciplines(currentDisciplines)

        setForm({
          firstName: athlete.authUser?.firstName ?? '',
          lastName: athlete.authUser?.lastName ?? '',
          birthDate: athlete.birthDate ?? '',
          gender: athlete.gender ?? '',
          email: athlete.authUser?.email ?? '',
          username: athlete.authUser?.username ?? '',
          accountStatus: athlete.authUser?.accountStatus ?? '',
          phone: athlete.phone ?? '',
          weightKg: athlete.weightKg ?? '',
          heightMeters: athlete.heightMeters ?? '',
          dominantArm: athlete.dominantArm ?? '',
          dominantLeg: athlete.dominantLeg ?? '',
          injuryHistory: athlete.injuryHistory ?? '',
          teamIds: currentTeams
            .map((team) => team.id)
            .filter((teamId) => teamId != null),
          positionIds: currentPositions
            .map((position) => position.id)
            .filter((positionId) => positionId != null),
          disciplineIds: currentDisciplines
            .map((discipline) => discipline.id)
            .filter((disciplineId) => disciplineId != null),
        })
      } catch (requestError) {
        console.error(
          'Erreur lors du chargement du profil athlète :',
          requestError,
        )

        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Une erreur est survenue lors du chargement.',
        )
      } finally {
        setLoading(false)
      }
    }

    loadPage()
  }, [id])

  const selectedTeamNames = useMemo(() => {
    const teamSource = teams.length > 0 ? teams : athleteTeams

    return teamSource
      .filter((team) => form.teamIds.includes(Number(team.id)))
      .map((team) => team.name)
  }, [athleteTeams, form.teamIds, teams])

  const isInactive = form.accountStatus?.trim().toUpperCase() === 'INACTIVE'

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

  const handleTeamChange = (event) => {
    const selectedIds = Array.from(
      event.target.selectedOptions,
      (option) => Number(option.value),
    )

    updateField('teamIds', selectedIds)
  }

  const validate = () => {
    const errors = {}

    if (form.phone && !/^[+()\d\s.-]{7,25}$/.test(form.phone.trim())) {
      errors.phone = 'Le numéro de téléphone est invalide.'
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

    if (form.teamIds.length === 0) {
      errors.teamIds = 'L’athlète doit être associé à au moins une équipe.'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!validate()) {
        setSuccess('')
        setError('Veuillez corriger les erreurs du formulaire.')
        return
    }

    const confirmed = window.confirm(
        'Voulez-vous vraiment enregistrer les modifications du profil athlète?',
    )

    if (!confirmed) {
        return
    }

    try {
        setSaving(true)
        setError('')
        setSuccess('')

        const response = await fetch(`http://localhost:8080/api/athlete/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            phone: form.phone.trim() || null,
            weightKg: Number(form.weightKg),
            injuryHistory: form.injuryHistory.trim() || null,
            teamIds: form.teamIds,
            positionIds: [],
            disciplineIds: [],
        }),
        })

        if (response.status === 401) {
        throw new Error('Votre session a expiré. Veuillez vous reconnecter.')
        }

        if (response.status === 403) {
        throw new Error(
            'Vous n’êtes pas autorisé à modifier ce profil athlète.',
        )
        }

        if (!response.ok) {
        const message = await readErrorMessage(response)

        throw new Error(
            message ||
            `Impossible d’enregistrer les modifications. Erreur ${response.status}.`,
        )
        }

        setSuccess('Le profil athlète a été modifié avec succès.')
    } catch (requestError) {
        console.error(
        'Erreur lors de la modification de l’athlète :',
        requestError,
        )

        setError(
        requestError instanceof Error
            ? requestError.message
            : 'Une erreur est survenue pendant la modification.',
        )
    } finally {
        setSaving(false)
    }
    }

  const handleDeactivate = async () => {
    const confirmed = window.confirm(
      'Voulez-vous vraiment désactiver cet athlète? Il ne pourra plus se connecter.',
    )

    if (!confirmed) return

    try {
      setDeactivating(true)
      setError('')
      setSuccess('')

      const response = await fetch(
        `http://localhost:8080/api/athlete/${id}/deactivate`,
        {
          method: 'PUT',
          credentials: 'include',
          headers: {
            Accept: 'application/json',
          },
        },
      )

      if (response.status === 401) {
        throw new Error('Votre session a expiré. Veuillez vous reconnecter.')
      }

      if (response.status === 403) {
        throw new Error(
          'Vous n’êtes pas autorisé à désactiver ce profil athlète.',
        )
      }

      if (!response.ok) {
        const message = await readErrorMessage(response)

        throw new Error(
          message ||
            `Impossible de désactiver l’athlète. Erreur ${response.status}.`,
        )
      }

      setForm((current) => ({
        ...current,
        accountStatus: 'INACTIVE',
      }))

      setSuccess('Le compte de l’athlète a été désactivé avec succès.')
    } catch (requestError) {
      console.error(
        'Erreur lors de la désactivation de l’athlète :',
        requestError,
      )

      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Une erreur est survenue pendant la désactivation.',
      )
    } finally {
      setDeactivating(false)
    }
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
        <div className="form-message form-message--error">{error}</div>

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
      <form className="entity-form" onSubmit={handleSubmit}>
        {success && (
          <div className="form-message form-message--success" role="status">
            {success}
          </div>
        )}

        {error && (
          <div className="form-message form-message--error" role="alert">
            {error}
          </div>
        )}

        <section className="form-section">
          <h2>Informations personnelles</h2>

          <div className="form-grid">
            <ReadOnlyField label="Prénom" value={form.firstName} />

            <ReadOnlyField label="Nom" value={form.lastName} />

            <ReadOnlyField
              label="Date de naissance"
              value={form.birthDate}
              type="date"
            />

            <ReadOnlyField label="Sexe" value={form.gender} />

            <div className="form-field full-width">
              <label htmlFor="athlete-email">Courriel</label>

              <input
                id="athlete-email"
                type="email"
                value={form.email}
                readOnly
                disabled
              />
            </div>

            <div className="form-field full-width">
              <label htmlFor="athlete-phone">Téléphone</label>

              <input
                id="athlete-phone"
                type="tel"
                value={form.phone}
                placeholder="Ex. : 514 555-1234"
                onChange={(event) => updateField('phone', event.target.value)}
                aria-invalid={Boolean(fieldErrors.phone)}
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
              <label htmlFor="athlete-teams">Équipe</label>

              {teams.length > 0 ? (
                <select
                  id="athlete-teams"
                  multiple
                  value={form.teamIds.map(String)}
                  onChange={handleTeamChange}
                  aria-invalid={Boolean(fieldErrors.teamIds)}
                >
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={selectedTeamNames.join(', ') || 'Aucune équipe'}
                  readOnly
                  disabled
                />
              )}

              {teams.length > 0 && (
                <small>
                  Maintenez Commande sur Mac ou Ctrl sur Windows pour
                  sélectionner plusieurs équipes.
                </small>
              )}

              {fieldErrors.teamIds && (
                <small className="form-field__error">
                  {fieldErrors.teamIds}
                </small>
              )}
            </div>

            <ReadOnlyField
              label="Position / Discipline"
              value={
                [
                  ...athletePositions.map((position) => position.name),
                  ...athleteDisciplines.map((discipline) => discipline.name),
                ]
                  .filter(Boolean)
                  .join(', ') || 'Non spécifié'
              }
            />

            <ReadOnlyField
              label="Taille"
              value={form.heightMeters !== '' ? `${form.heightMeters} m` : ''}
            />

            <div className="form-field">
              <label htmlFor="athlete-weight">Poids</label>

              <input
                id="athlete-weight"
                type="number"
                min="0.1"
                max="500"
                step="0.1"
                value={form.weightKg}
                placeholder="Ex. : 75"
                onChange={(event) =>
                  updateField('weightKg', event.target.value)
                }
                aria-invalid={Boolean(fieldErrors.weightKg)}
                required
              />

              {fieldErrors.weightKg && (
                <small className="form-field__error">
                  {fieldErrors.weightKg}
                </small>
              )}
            </div>

            <ReadOnlyField label="Bras dominant" value={form.dominantArm} />

            <ReadOnlyField label="Jambe dominante" value={form.dominantLeg} />
          </div>
        </section>

        <section className="form-section">
          <h2>Compte utilisateur</h2>

          <div className="form-grid form-grid--three">
            <ReadOnlyField label="Nom d'utilisateur" value={form.username} />

            <ReadOnlyField
              label="Statut du compte"
              value={
                STATUS_LABELS[form.accountStatus.trim().toUpperCase()] ||
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
                updateField('injuryHistory', event.target.value)
              }
            />
          </div>
        </section>

        <section className="deactivate-section">
          <div className="deactivate-section__content">
            <span className="deactivate-section__icon" aria-hidden="true">
              ⚠
            </span>

            <div>
              <h2>Désactiver le compte</h2>

              <p>
                La désactivation rendra l’athlète inactif. Il ne pourra plus se
                connecter ni apparaître dans les sélections ou les rapports.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="btn-danger-outline"
            onClick={handleDeactivate}
            disabled={deactivating || saving || isInactive}
          >
            {isInactive
              ? 'Compte désactivé'
              : deactivating
                ? 'Désactivation...'
                : 'Désactiver le compte'}
          </button>
        </section>
        
        {success && (
            <section className="success-section" role="status">
                <div className="success-section__content">
                <span className="success-section__icon" aria-hidden="true">
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
            {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </div>
      </form>
    </div>
  )
}

function ReadOnlyField({ label, value, type = 'text' }) {
  return (
    <div className="form-field">
      <label>{label}</label>

      <input type={type} value={value ?? ''} readOnly disabled />
    </div>
  )
}

function normalizeTeamsResponse(data) {
  if (Array.isArray(data)) {
    return data.map(normalizeTeam).filter(Boolean)
  }

  const possibleArrays = [data?.teams, data?.content, data?.items]
  const teamArray = possibleArrays.find(Array.isArray)

  return teamArray ? teamArray.map(normalizeTeam).filter(Boolean) : []
}

function normalizeTeam(team) {
  const id = team?.id ?? team?.teamId
  const name = team?.name ?? team?.teamName

  if (id == null || !name) {
    return null
  }

  return {
    id: Number(id),
    name,
  }
}

async function readErrorMessage(response) {
  try {
    const contentType = response.headers.get('content-type') ?? ''

    if (contentType.includes('application/json')) {
      const data = await response.json()

      return data.message || data.error || data.erreur || ''
    }

    return await response.text()
  } catch {
    return ''
  }
}
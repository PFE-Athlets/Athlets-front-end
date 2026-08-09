import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { athleteService } from '../../api/athleteService'
import { teamService } from '../../api/teamService'
import '../../styles/create-athlete.css'
import '../../styles/link-modal.css'

const INITIAL_FORM = {
  firstName: '',
  lastName: '',
  birthDate: '',
  gender: '',
  email: '',
  athleteTeamId: '',
  athletePositionId: '',
  athleteDisciplineId: '',
  heightMeters: '',
  weightKg: '',
  dominantArm: '',
  dominantLeg: '',
  username: '',
  injuryHistory: '',
}

const getMaximumBirthDate = () => {
  const today = new Date()

  const maxDate = new Date(
    today.getFullYear() - 18,
    today.getMonth(),
    today.getDate(),
  )

  const year = maxDate.getFullYear()

  const month = String(
    maxDate.getMonth() + 1,
  ).padStart(2, '0')

  const day = String(
    maxDate.getDate(),
  ).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export default function CreateAthletePage() {
  const navigate = useNavigate()

  const currentUser = useMemo(() => {
    try {
      const storedUser =
        sessionStorage.getItem('currentUser')

      return storedUser
        ? JSON.parse(storedUser)
        : null
    } catch {
      return null
    }
  }, [])

  const isCoach =
    Number(currentUser?.accessLevel) === 2

  const maximumBirthDate =
    getMaximumBirthDate()

  const [form, setForm] = useState(INITIAL_FORM)
  const [teams, setTeams] = useState([])
  const [positions, setPositions] = useState([])
  const [disciplines, setDisciplines] = useState([])

  const [loadingTeams, setLoadingTeams] =
    useState(true)

  const [loadingExtras, setLoadingExtras] =
    useState(false)

  const [submitting, setSubmitting] =
    useState(false)

  const [error, setError] = useState('')
  const [activationLink, setActivationLink] =
    useState('')

  const [copySuccess, setCopySuccess] =
    useState(false)

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  useEffect(() => {
    const loadTeams = async () => {
      setLoadingTeams(true)

      const result =
        await teamService.getDisplayTeams()

      if (!result.success) {
        setError(
          result.error ||
            'Impossible de charger les équipes.',
        )

        setTeams([])
        setLoadingTeams(false)
        return
      }

      const loadedTeams =
        Array.isArray(result.data)
          ? result.data
          : []

      setTeams(loadedTeams)

      /*
       * Un coach reçoit déjà seulement
       * les équipes auxquelles il a accès.
       *
       * On sélectionne donc automatiquement
       * sa première équipe.
       */
      if (
        isCoach &&
        loadedTeams.length > 0
      ) {
        setForm((current) => {
          /*
           * Ne pas écraser une sélection
           * déjà présente.
           */
          if (current.athleteTeamId) {
            return current
          }

          return {
            ...current,
            athleteTeamId: String(
              loadedTeams[0].id,
            ),
            athletePositionId: '',
            athleteDisciplineId: '',
          }
        })
      }

      setLoadingTeams(false)
    }

    loadTeams()
  }, [isCoach])

  useEffect(() => {
    const teamId = form.athleteTeamId

    if (!teamId) {
      setPositions([])
      setDisciplines([])
      return
    }

    const selectedTeam = teams.find(
      (team) =>
        String(team.id) ===
        String(teamId),
    )

    const sportId = selectedTeam?.sportId

    if (!sportId) {
      setPositions([])
      setDisciplines([])
      return
    }

    const loadExtras = async () => {
      setLoadingExtras(true)

      const result =
        await teamService.getDisciplinesAndPositionsBySportId(
          sportId,
        )

      if (!result.success) {
        setError(
          result.error ||
            'Impossible de charger les positions et disciplines.',
        )

        setPositions([])
        setDisciplines([])
        setLoadingExtras(false)
        return
      }

      setPositions(
        result.data?.positions ?? [],
      )

      setDisciplines(
        result.data?.disciplines ?? [],
      )

      setLoadingExtras(false)
    }

    loadExtras()
  }, [form.athleteTeamId, teams])

  const handleTeamChange = (event) => {
    setForm((current) => ({
      ...current,
      athleteTeamId: event.target.value,
      athletePositionId: '',
      athleteDisciplineId: '',
    }))
  }

  const buildPayload = () => ({
    firstName: form.firstName.trim(),

    lastName: form.lastName.trim(),

    birthDate: form.birthDate,

    gender: form.gender,

    email: form.email.trim(),

    username: form.username.trim(),

    heightMeters: form.heightMeters
      ? Number(form.heightMeters)
      : 0,

    weightKg: form.weightKg
      ? Number(form.weightKg)
      : null,

    dominantArm:
      form.dominantArm || null,

    dominantLeg:
      form.dominantLeg || null,

    injuryHistory:
      form.injuryHistory.trim() || null,

    teamsInfo: [
      {
        teamId: Number(
          form.athleteTeamId,
        ),

        positionId:
          form.athletePositionId
            ? Number(
                form.athletePositionId,
              )
            : null,

        disciplineId:
          form.athleteDisciplineId
            ? Number(
                form.athleteDisciplineId,
              )
            : null,
      },
    ],
  })

  const handleSubmit = async (event) => {
    event.preventDefault()

    setError('')
    setSubmitting(true)

    if (!form.athleteTeamId) {
      setError(
        'Veuillez sélectionner une équipe.',
      )

      setSubmitting(false)
      return
    }

    if (!form.birthDate) {
      setError(
        'Veuillez sélectionner une date de naissance.',
      )

      setSubmitting(false)
      return
    }

    /*
     * Sécurité supplémentaire au cas où
     * la validation HTML serait contournée.
     */
    if (
      form.birthDate >
      maximumBirthDate
    ) {
      setError(
        'L’athlète doit avoir au moins 18 ans.',
      )

      setSubmitting(false)
      return
    }

    const result =
      await athleteService.createAthlete(
        buildPayload(),
      )

    if (!result.success) {
      setError(
        result.error ||
          'Impossible de créer l’athlète.',
      )

      setSubmitting(false)
      return
    }

    if (!result.data) {
      setError(
        'L’athlète a été créé, mais aucun lien d’activation n’a été retourné.',
      )

      setSubmitting(false)
      return
    }

    setActivationLink(result.data)
    setSubmitting(false)
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(
        activationLink,
      )

      setCopySuccess(true)

      setTimeout(() => {
        setCopySuccess(false)
      }, 2000)
    } catch (error) {
      console.error(
        'Impossible de copier le lien :',
        error,
      )
    }
  }

  const handleOpenActivationLink = () => {
    if (!activationLink) {
      return
    }

    try {
      const activationUrl =
        new URL(activationLink)

      const token =
        activationUrl.searchParams.get(
          'token',
        )

      if (
        activationUrl.origin !==
          window.location.origin ||
        activationUrl.pathname !==
          '/activation-compte' ||
        !token
      ) {
        setError(
          "Le lien d'activation est invalide.",
        )

        return
      }

      const safeUrl =
        `/activation-compte?token=${encodeURIComponent(
          token,
        )}`

      window.open(
        safeUrl,
        '_blank',
        'noopener,noreferrer',
      )
    } catch {
      setError(
        "Le lien d'activation est invalide.",
      )
    }
  }

  return (
    <div className="create-page">
      <form
        className="entity-form"
        onSubmit={handleSubmit}
      >
        <section className="form-section">
          <h2>
            Informations personnelles
          </h2>

          <div className="form-grid">
            <Field
              label="Prénom"
              required
            >
              <input
                type="text"
                placeholder="Ex. : Léa"
                value={form.firstName}
                onChange={(e) =>
                  updateField(
                    'firstName',
                    e.target.value,
                  )
                }
                required
              />
            </Field>

            <Field
              label="Nom"
              required
            >
              <input
                type="text"
                placeholder="Ex. : Martin"
                value={form.lastName}
                onChange={(e) =>
                  updateField(
                    'lastName',
                    e.target.value,
                  )
                }
                required
              />
            </Field>

            <Field label="Date de naissance">
              <input
                type="date"
                value={form.birthDate}
                max={maximumBirthDate}
                onChange={(e) =>
                  updateField(
                    'birthDate',
                    e.target.value,
                  )
                }
                required
              />
            </Field>

            <Field label="Sexe">
              <select
                value={form.gender}
                onChange={(e) =>
                  updateField(
                    'gender',
                    e.target.value,
                  )
                }
                required
              >
                <option value="">
                  Sélectionner
                </option>

                <option value="Female">
                  Femme
                </option>

                <option value="Male">
                  Homme
                </option>
              </select>
            </Field>

            <Field
              label="Courriel"
              fullWidth
            >
              <input
                type="email"
                placeholder="Ex. : lea.martin@athlets.com"
                value={form.email}
                onChange={(e) =>
                  updateField(
                    'email',
                    e.target.value,
                  )
                }
                required
              />
            </Field>
          </div>
        </section>

        <section className="form-section">
          <h2>Profil sportif</h2>

          <div className="form-grid">
            <Field label="Équipe">
              <select
                value={
                  form.athleteTeamId
                }
                onChange={
                  handleTeamChange
                }
                disabled={
                  loadingTeams ||
                  isCoach
                }
                required
              >
                <option value="">
                  {loadingTeams
                    ? 'Chargement...'
                    : 'Sélectionner'}
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
            </Field>

            <Field label="Position">
              <select
                value={
                  form.athletePositionId
                }
                onChange={(e) =>
                  updateField(
                    'athletePositionId',
                    e.target.value,
                  )
                }
                disabled={
                  !form.athleteTeamId ||
                  loadingExtras
                }
              >
                <option value="">
                  {loadingExtras
                    ? 'Chargement...'
                    : 'Aucune'}
                </option>

                {positions.map(
                  (position) => (
                    <option
                      key={position.id}
                      value={position.id}
                    >
                      {position.name}
                    </option>
                  ),
                )}
              </select>
            </Field>

            <Field label="Discipline">
              <select
                value={
                  form.athleteDisciplineId
                }
                onChange={(e) =>
                  updateField(
                    'athleteDisciplineId',
                    e.target.value,
                  )
                }
                disabled={
                  !form.athleteTeamId ||
                  loadingExtras
                }
              >
                <option value="">
                  {loadingExtras
                    ? 'Chargement...'
                    : 'Aucune'}
                </option>

                {disciplines.map(
                  (discipline) => (
                    <option
                      key={
                        discipline.id
                      }
                      value={
                        discipline.id
                      }
                    >
                      {
                        discipline.name
                      }
                    </option>
                  ),
                )}
              </select>
            </Field>

            <Field label="Taille (cm)">
              <input
                type="number"
                min="1"
                placeholder="Ex. : 180"
                value={
                  form.heightMeters
                }
                onChange={(e) =>
                  updateField(
                    'heightMeters',
                    e.target.value,
                  )
                }
              />
            </Field>

            <Field label="Poids (kg)">
              <input
                type="number"
                min="1"
                step="0.1"
                placeholder="Ex. : 75"
                value={form.weightKg}
                onChange={(e) =>
                  updateField(
                    'weightKg',
                    e.target.value,
                  )
                }
              />
            </Field>

            <Field label="Bras dominant">
              <select
                value={
                  form.dominantArm
                }
                onChange={(e) =>
                  updateField(
                    'dominantArm',
                    e.target.value,
                  )
                }
              >
                <option value="">
                  Sélectionner
                </option>

                <option value="Right">
                  Droit
                </option>

                <option value="Left">
                  Gauche
                </option>
              </select>
            </Field>

            <Field label="Jambe dominante">
              <select
                value={
                  form.dominantLeg
                }
                onChange={(e) =>
                  updateField(
                    'dominantLeg',
                    e.target.value,
                  )
                }
              >
                <option value="">
                  Sélectionner
                </option>

                <option value="Right">
                  Droite
                </option>

                <option value="Left">
                  Gauche
                </option>
              </select>
            </Field>
          </div>
        </section>

        <section className="form-section">
          <h2>Compte utilisateur</h2>

          <div className="form-grid">
            <Field label="Nom d'utilisateur">
              <input
                type="text"
                placeholder="Ex. : lea.martin"
                value={form.username}
                onChange={(e) =>
                  updateField(
                    'username',
                    e.target.value,
                  )
                }
                required
              />
            </Field>

            <Field label="Statut du compte">
              <input
                value="En attente d’activation"
                disabled
              />
            </Field>
          </div>
        </section>

        <section className="form-section form-section--notes">
          <h2>
            Historique médical et notes
          </h2>

          <Field
            label="Historique des blessures et notes"
            fullWidth
          >
            <textarea
              placeholder="Ex. : Antécédents de blessures, interventions..."
              value={
                form.injuryHistory
              }
              onChange={(e) =>
                updateField(
                  'injuryHistory',
                  e.target.value,
                )
              }
            />
          </Field>
        </section>

        {error && (
          <div className="form-error">
            {error}
          </div>
        )}

        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() =>
              navigate('/athletes')
            }
            disabled={submitting}
          >
            Annuler
          </button>

          <button
            type="submit"
            className="btn-primary"
            disabled={
              submitting ||
              loadingTeams
            }
          >
            {submitting
              ? 'Création...'
              : "Créer l'athlète"}
          </button>
        </div>
      </form>

      {activationLink && (
        <ActivationModal
          link={activationLink}
          copySuccess={copySuccess}
          onCopy={handleCopyLink}
          onOpen={
            handleOpenActivationLink
          }
          onClose={() =>
            navigate('/athletes')
          }
        />
      )}
    </div>
  )
}

function Field({
  label,
  fullWidth = false,
  children,
}) {
  return (
    <div
      className={`form-field ${
        fullWidth
          ? 'full-width'
          : ''
      }`}
    >
      <label>{label}</label>

      {children}
    </div>
  )
}

function ActivationModal({
  link,
  copySuccess,
  onCopy,
  onOpen,
  onClose,
}) {
  return (
    <div className="link-modal-overlay">
      <div
        className="link-modal"
        role="dialog"
        aria-modal="true"
      >
        <div className="link-modal__header">
          <h2>
            Athlète créé avec succès
          </h2>

          <p>
            Le compte est en attente
            d’activation.
          </p>
        </div>

        <div className="link-modal__content">
          <p>
            Utilisez ce lien pour
            activer le compte de
            l’athlète.
          </p>

          <div className="link-modal__link">
            {link}
          </div>

          {copySuccess && (
            <p className="link-modal__copy-success">
              Lien copié.
            </p>
          )}
        </div>

        <div className="link-modal__actions">
          <button
            type="button"
            className="link-modal__button link-modal__button--secondary"
            onClick={onCopy}
          >
            {copySuccess
              ? 'Copié'
              : 'Copier le lien'}
          </button>

          <button
            type="button"
            className="link-modal__button link-modal__button--secondary"
            onClick={onOpen}
          >
            Ouvrir le lien
          </button>

          <button
            type="button"
            className="link-modal__button link-modal__button--primary"
            onClick={onClose}
          >
            Terminer
          </button>
        </div>
      </div>
    </div>
  )
}
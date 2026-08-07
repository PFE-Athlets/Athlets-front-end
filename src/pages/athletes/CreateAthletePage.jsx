import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { athleteService } from '../../api/athleteService'
import { teamService } from '../../api/teamService'
import '../../styles/page-form.css'

const INITIAL_FORM = {
  firstName: '',
  lastName: '',
  birthDate: '',
  gender: '',
  email: '',

  athleteTeamId: '',
  athleteTeamName: '',
  athletePositionId: '',
  athleteDisciplineId: '',

  heightMeters: '',
  weightKg: '',
  dominantArm: '',
  dominantLeg: '',

  username: '',
  injuryHistory: '',

  accountStatus: 'Pending',
}

export default function CreateAthletePage() {
  const navigate = useNavigate()

  const [form, setForm] = useState(INITIAL_FORM)
  const [teams, setTeams] = useState([])
  const [positions, setPositions] = useState([])
  const [disciplines, setDisciplines] = useState([])

  const [loadingTeams, setLoadingTeams] = useState(true)
  const [loadingSportExtras, setLoadingSportExtras] =
    useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [activationLink, setActivationLink] =
    useState('')

  const [copySuccess, setCopySuccess] =
    useState(false)

  const teamSelected =
    form.athleteTeamId !== ''

  useEffect(() => {
    const fetchTeams = async () => {
      setLoadingTeams(true)
      setError('')

      const result =
        await teamService.getDisplayTeams()

      if (!result.success) {
        console.error(
          'Erreur lors du chargement des équipes :',
          result.error,
        )

        setError(
          result.error ||
            'Impossible de charger les équipes.',
        )

        setLoadingTeams(false)
        return
      }

      setTeams(result.data)
      setLoadingTeams(false)
    }

    fetchTeams()
  }, [])

  useEffect(() => {
    const selectedTeamId =
      form.athleteTeamId

    if (!selectedTeamId) {
      setPositions([])
      setDisciplines([])
      return
    }

    const selectedTeam = teams.find(
      (team) =>
        String(team.id) ===
        String(selectedTeamId),
    )

    const selectedSportId =
      selectedTeam?.sportId

    if (!selectedSportId) {
      setPositions([])
      setDisciplines([])
      return
    }

    let isActive = true

    const fetchSportExtras = async () => {
      setLoadingSportExtras(true)

      const result =
        await teamService
          .getDisciplinesAndPositionsBySportId(
            selectedSportId,
          )

      if (!isActive) {
        return
      }

      if (!result.success) {
        console.error(
          'Erreur lors du chargement des positions/disciplines :',
          result.error,
        )

        setError(
          result.error ||
            'Impossible de charger les positions et disciplines pour cette équipe.',
        )

        setPositions([])
        setDisciplines([])
        setLoadingSportExtras(false)
        return
      }

      setError('')
      setPositions(
        result.data.positions ?? [],
      )
      setDisciplines(
        result.data.disciplines ?? [],
      )

      setLoadingSportExtras(false)
    }

    fetchSportExtras()

    return () => {
      isActive = false
    }
  }, [form.athleteTeamId, teams])

  const updateField = (field, value) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    setSubmitting(true)
    setError('')

    if (!form.athleteTeamId) {
      setError(
        'Veuillez sélectionner une équipe.',
      )

      setSubmitting(false)
      return
    }

    const payload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      birthDate: form.birthDate,
      gender: form.gender,
      email: form.email.trim(),

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

      username: form.username.trim(),

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
    }

    console.log(
      'Payload création athlète :',
      payload,
    )

    try {
      const result =
        await athleteService.createAthlete(
          payload,
        )

      if (!result.success) {
        console.error(
          'Erreur lors de la création de l’athlète :',
          result.error,
        )

        setError(
          result.error ||
            'Une erreur est survenue lors de la création de l’athlète.',
        )

        return
      }

      if (!result.data) {
        setError(
          'L’athlète a été créé, mais aucun lien d’activation n’a été retourné.',
        )

        return
      }

      setActivationLink(result.data)
    } catch (submitError) {
      console.error(
        'Erreur lors de la création de l’athlète :',
        submitError,
      )

      setError(
        'Une erreur inattendue est survenue lors de la création de l’athlète.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = () => {
    navigate('/athletes')
  }

  const handleCloseModal = () => {
    navigate('/athletes')
  }

  const handleOpenActivationLink = () => {
    if (!activationLink) {
      return
    }

    window.open(
      activationLink,
      '_blank',
      'noopener,noreferrer',
    )
  }

  const handleCopyActivationLink =
    async () => {
      if (!activationLink) {
        return
      }

      try {
        await navigator.clipboard.writeText(
          activationLink,
        )

        setCopySuccess(true)

        window.setTimeout(() => {
          setCopySuccess(false)
        }, 2000)
      } catch (copyError) {
        console.error(
          'Impossible de copier le lien :',
          copyError,
        )
      }
    }

  return (
    <div className="create-page">
      <form
        className="entity-form"
        onSubmit={handleSubmit}
      >
        {error && (
          <div className="form-error">
            {error}
          </div>
        )}

        <section className="form-section">
          <h2>
            Informations personnelles
          </h2>

          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="firstName">
                Prénom
              </label>

              <input
                id="firstName"
                type="text"
                placeholder="Ex. : Léa"
                value={form.firstName}
                onChange={(event) =>
                  updateField(
                    'firstName',
                    event.target.value,
                  )
                }
                required
                disabled={submitting}
              />
            </div>

            <div className="form-field">
              <label htmlFor="lastName">
                Nom
              </label>

              <input
                id="lastName"
                type="text"
                placeholder="Ex. : Martin"
                value={form.lastName}
                onChange={(event) =>
                  updateField(
                    'lastName',
                    event.target.value,
                  )
                }
                required
                disabled={submitting}
              />
            </div>

            <div className="form-field">
              <label htmlFor="birthDate">
                Date de naissance
              </label>

              <input
                id="birthDate"
                type="date"
                value={form.birthDate}
                onChange={(event) =>
                  updateField(
                    'birthDate',
                    event.target.value,
                  )
                }
                required
                disabled={submitting}
              />
            </div>

            <div className="form-field">
              <label htmlFor="gender">
                Sexe
              </label>

              <select
                id="gender"
                value={form.gender}
                onChange={(event) =>
                  updateField(
                    'gender',
                    event.target.value,
                  )
                }
                required
                disabled={submitting}
              >
                <option
                  value=""
                  disabled
                >
                  Sélectionner
                </option>

                <option value="Female">
                  Femme
                </option>

                <option value="Male">
                  Homme
                </option>
              </select>
            </div>

            <div className="form-field full-width">
              <label htmlFor="email">
                Courriel
              </label>

              <input
                id="email"
                type="email"
                placeholder="Ex. : lea.martin@athlets.com"
                value={form.email}
                onChange={(event) =>
                  updateField(
                    'email',
                    event.target.value,
                  )
                }
                required
                disabled={submitting}
              />
            </div>
          </div>
        </section>

        <section className="form-section">
          <h2>Profil sportif</h2>

          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="athleteTeamName">
                Équipe
              </label>

              <select
                id="athleteTeamName"
                value={
                  form.athleteTeamId
                }
                onChange={(event) => {
                  const selectedTeamId =
                    event.target.value

                  const selectedTeam =
                    teams.find(
                      (team) =>
                        String(
                          team.id,
                        ) ===
                        String(
                          selectedTeamId,
                        ),
                    )

                  updateField(
                    'athleteTeamId',
                    selectedTeamId,
                  )

                  updateField(
                    'athleteTeamName',
                    selectedTeam?.name ||
                      '',
                  )

                  updateField(
                    'athletePositionId',
                    '',
                  )

                  updateField(
                    'athleteDisciplineId',
                    '',
                  )
                }}
                disabled={
                  loadingTeams ||
                  submitting
                }
                required
              >
                <option
                  value=""
                  disabled
                >
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
            </div>

            <div className="form-field">
              <label htmlFor="athletePositionId">
                Position
              </label>

              <select
                id="athletePositionId"
                value={
                  form.athletePositionId
                }
                onChange={(event) =>
                  updateField(
                    'athletePositionId',
                    event.target.value,
                  )
                }
                disabled={
                  !teamSelected ||
                  submitting
                }
              >
                <option value="">
                  {teamSelected
                    ? loadingSportExtras
                      ? 'Chargement...'
                      : 'Aucune'
                    : 'Sélectionner une équipe d’abord'}
                </option>

                {positions.map(
                  (position) => (
                    <option
                      key={
                        position.id ??
                        position
                      }
                      value={
                        position.id ??
                        position
                      }
                    >
                      {position.name ??
                        position}
                    </option>
                  ),
                )}
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="athleteDisciplineId">
                Discipline
              </label>

              <select
                id="athleteDisciplineId"
                value={
                  form.athleteDisciplineId
                }
                onChange={(event) =>
                  updateField(
                    'athleteDisciplineId',
                    event.target.value,
                  )
                }
                disabled={
                  !teamSelected ||
                  submitting
                }
              >
                <option value="">
                  {teamSelected
                    ? loadingSportExtras
                      ? 'Chargement...'
                      : 'Aucune'
                    : 'Sélectionner une équipe d’abord'}
                </option>

                {disciplines.map(
                  (discipline) => (
                    <option
                      key={
                        discipline.id ??
                        discipline
                      }
                      value={
                        discipline.id ??
                        discipline
                      }
                    >
                      {discipline.name ??
                        discipline}
                    </option>
                  ),
                )}
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="heightMeters">
                Taille (cm)
              </label>

              <input
                id="heightMeters"
                type="number"
                min="1"
                step="1"
                placeholder="Ex. : 180"
                value={
                  form.heightMeters
                }
                onChange={(event) =>
                  updateField(
                    'heightMeters',
                    event.target.value,
                  )
                }
                disabled={submitting}
              />
            </div>

            <div className="form-field">
              <label htmlFor="weightKg">
                Poids (kg)
              </label>

              <input
                id="weightKg"
                type="number"
                min="1"
                step="0.1"
                placeholder="Ex. : 75"
                value={form.weightKg}
                onChange={(event) =>
                  updateField(
                    'weightKg',
                    event.target.value,
                  )
                }
                disabled={submitting}
              />
            </div>

            <div className="form-field">
              <label htmlFor="dominantArm">
                Bras dominant
              </label>

              <select
                id="dominantArm"
                value={
                  form.dominantArm
                }
                onChange={(event) =>
                  updateField(
                    'dominantArm',
                    event.target.value,
                  )
                }
                disabled={submitting}
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
            </div>

            <div className="form-field">
              <label htmlFor="dominantLeg">
                Jambe dominante
              </label>

              <select
                id="dominantLeg"
                value={
                  form.dominantLeg
                }
                onChange={(event) =>
                  updateField(
                    'dominantLeg',
                    event.target.value,
                  )
                }
                disabled={submitting}
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
            </div>
          </div>
        </section>

        <section className="form-section">
          <h2>Compte utilisateur</h2>

          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="username">
                Nom d'utilisateur
              </label>

              <input
                id="username"
                type="text"
                placeholder="Ex. : lea.martin"
                value={form.username}
                onChange={(event) =>
                  updateField(
                    'username',
                    event.target.value,
                  )
                }
                required
                disabled={submitting}
              />
            </div>

            <div className="form-field">
              <label htmlFor="accountStatus">
                Statut du compte
              </label>

              <input
                id="accountStatus"
                type="text"
                value="En attente d’activation"
                disabled
              />
            </div>
          </div>
        </section>

        <section className="form-section form-section--notes">
          <h2>
            Historique médical et notes
          </h2>

          <div className="form-field full-width">
            <label htmlFor="injuryHistory">
              Historique des blessures et notes
            </label>

            <textarea
              id="injuryHistory"
              placeholder="Ex. : Antécédents de blessures, interventions, recommandations particulières..."
              value={
                form.injuryHistory
              }
              onChange={(event) =>
                updateField(
                  'injuryHistory',
                  event.target.value,
                )
              }
              disabled={submitting}
            />
          </div>
        </section>

        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={handleCancel}
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
        <div
          className="activation-modal-overlay"
          role="presentation"
        >
          <div
            className="activation-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="activation-modal-title"
          >
            <div className="activation-modal__header">
              <div>
                <h2 id="activation-modal-title">
                  Athlète créé avec succès
                </h2>

                <p>
                  Le compte est maintenant en attente
                  d’activation.
                </p>
              </div>
            </div>

            <div className="activation-modal__content">
              <p>
                Puisque l’envoi par courriel n’est pas
                encore configuré, utilisez ce lien pour
                activer le compte de l’athlète.
              </p>

              <div className="activation-modal__link">
                {activationLink}
              </div>

              {copySuccess && (
                <p className="activation-modal__copy-success">
                  Lien copié.
                </p>
              )}
            </div>

            <div className="activation-modal__actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={
                  handleCopyActivationLink
                }
              >
                {copySuccess
                  ? 'Copié'
                  : 'Copier le lien'}
              </button>

              <button
                type="button"
                className="btn-secondary"
                onClick={
                  handleOpenActivationLink
                }
              >
                Ouvrir le lien
              </button>

              <button
                type="button"
                className="btn-primary"
                onClick={handleCloseModal}
              >
                Terminer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
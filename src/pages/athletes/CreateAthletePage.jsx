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

  athleteTeamName: '',

  heightMeters: '',
  weightKg: '',
  dominantArm: '',
  dominantLeg: '',

  username: '',
  injuryHistory: '',

  accountStatus: 'A_ACTIVER',
}

export default function CreateAthletePage() {
  const navigate = useNavigate()

  const [form, setForm] = useState(INITIAL_FORM)
  const [teams, setTeams] = useState([])

  const [loadingTeams, setLoadingTeams] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchTeams = async () => {
      setLoadingTeams(true)
      setError('')

      const result = await teamService.getDisplayTeams()

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

    const result = await athleteService.createAthlete(form)

    if (!result.success) {
      console.error(
        'Erreur lors de la création de l’athlète :',
        result.error,
      )

      setError(
        result.error ||
          'Une erreur est survenue lors de la création de l’athlète.',
      )

      setSubmitting(false)
      return
    }

    navigate('/athletes')
  }

  const handleCancel = () => {
    navigate('/athletes')
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
          <h2>Informations personnelles</h2>

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
              >
                <option value="" disabled>
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
                value={form.athleteTeamName}
                onChange={(event) =>
                  updateField(
                    'athleteTeamName',
                    event.target.value,
                  )
                }
                disabled={loadingTeams}
                required
              >
                <option value="" disabled>
                  {loadingTeams
                    ? 'Chargement...'
                    : 'Sélectionner'}
                </option>

                {teams.map((team) => (
                  <option
                    key={team.id}
                    value={team.name}
                  >
                    {team.name}
                  </option>
                ))}
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
                value={form.heightMeters}
                onChange={(event) =>
                  updateField(
                    'heightMeters',
                    event.target.value,
                  )
                }
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
              />
            </div>

            <div className="form-field">
              <label htmlFor="dominantArm">
                Bras dominant
              </label>

              <select
                id="dominantArm"
                value={form.dominantArm}
                onChange={(event) =>
                  updateField(
                    'dominantArm',
                    event.target.value,
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
            </div>

            <div className="form-field">
              <label htmlFor="dominantLeg">
                Jambe dominante
              </label>

              <select
                id="dominantLeg"
                value={form.dominantLeg}
                onChange={(event) =>
                  updateField(
                    'dominantLeg',
                    event.target.value,
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
          <h2>Historique médical et notes</h2>

          <div className="form-field full-width">
            <label htmlFor="injuryHistory">
              Historique des blessures et notes
            </label>

            <textarea
              id="injuryHistory"
              placeholder="Ex. : Antécédents de blessures, interventions, recommandations particulières..."
              value={form.injuryHistory}
              onChange={(event) =>
                updateField(
                  'injuryHistory',
                  event.target.value,
                )
              }
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
            disabled={submitting || loadingTeams}
          >
            {submitting
              ? 'Création...'
              : "Créer l'athlète"}
          </button>
        </div>
      </form>
    </div>
  )
}
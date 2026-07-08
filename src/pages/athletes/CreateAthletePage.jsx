import { useEffect, useState } from 'react'
import api from '../../api/config'
import '../../styles/page-form.css'

export default function CreateAthletePage() {
  const [teams, setTeams] = useState([])
  const [selectedTeam, setSelectedTeam] = useState('')
  const [selectedPosition, setSelectedPosition] = useState('')
  const [selectedDiscipline, setSelectedDiscipline] = useState('')
  const [teamsLoading, setTeamsLoading] = useState(true)
  const [teamsError, setTeamsError] = useState(null)
  const [positions] = useState([])
  const [disciplines] = useState([])

  const teamSelected = selectedTeam !== ''

  useEffect(() => {
    let cancelled = false

    const loadTeams = async () => {
      try {
        setTeamsLoading(true)
        setTeamsError(null)
        const response = await api.get('/api/sport/teams')

        if (!cancelled) {
          setTeams(Array.isArray(response.data) ? response.data : [])
        }
      } catch {
        if (!cancelled) {
          setTeams([])
          setTeamsError('Impossible de charger les équipes.')
        }
      } finally {
        if (!cancelled) {
          setTeamsLoading(false)
        }
      }
    }

    loadTeams()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="create-page">
      <form className="entity-form">
        <section className="form-section">
          <h2>Informations personnelles</h2>

          <div className="form-grid">
            <div className="form-field">
              <label>Prénom</label>
              <input type="text" placeholder="Ex. : Léa" />
            </div>

            <div className="form-field">
              <label>Nom</label>
              <input type="text" placeholder="Ex. : Martin" />
            </div>

            <div className="form-field">
              <label>Date de naissance</label>
              <input type="date" />
            </div>

            <div className="form-field">
              <label>Sexe</label>
              <select defaultValue="">
                <option value="" disabled>Sélectionner</option>
                <option>Femme</option>
                <option>Homme</option>
              </select>
            </div>

            <div className="form-field full-width">
              <label>Courriel</label>
              <input
                type="email"
                placeholder="Ex. : lea.martin@athlets.com"
              />
            </div>
          </div>
        </section>

        <section className="form-section">
          <h2>Profil sportif</h2>

          <div className="form-grid">
            <div className="form-field">
              <label>Équipe</label>
              <select
                value={selectedTeam}
                onChange={(event) => setSelectedTeam(event.target.value)}
                disabled={teamsLoading || teams.length === 0}
              >
                <option value="" disabled>
                  {teamsLoading ? 'Chargement des équipes...' : 'Sélectionner'}
                </option>
                {teams.map((team) => (
                  <option key={team} value={team}>{team}</option>
                ))}
              </select>
              {teamsError ? <p style={{ color: '#ef4444', margin: '8px 0 0', fontSize: '0.85rem' }}>{teamsError}</p> : null}
            </div>

            <div className="form-field">
              <label>Position</label>
              <select
                value={selectedPosition}
                onChange={(event) => setSelectedPosition(event.target.value)}
                disabled={!teamSelected}
              >
                <option value="" disabled>
                  {teamSelected ? 'En attente des positions backend' : 'Sélectionner une équipe d’abord'}
                </option>
                {positions.map((position) => (
                  <option key={position} value={position}>{position}</option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label>Discipline</label>
              <select
                value={selectedDiscipline}
                onChange={(event) => setSelectedDiscipline(event.target.value)}
                disabled={!teamSelected}
              >
                <option value="" disabled>
                  {teamSelected ? 'En attente des disciplines backend' : 'Sélectionner une équipe d’abord'}
                </option>
                {disciplines.map((discipline) => (
                  <option key={discipline} value={discipline}>{discipline}</option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label>Taille</label>
              <input
                type="text"
                placeholder="Ex. : 180 cm"
              />
            </div>

            <div className="form-field">
              <label>Poids</label>
              <input
                type="text"
                placeholder="Ex. : 75 kg"
              />
            </div>

            <div className="form-field">
              <label>Bras dominant</label>
              <select defaultValue="">
                <option value="" disabled>Sélectionner</option>
                <option>Droit</option>
                <option>Gauche</option>
                <option>Ambidextre</option>
              </select>
            </div>

            <div className="form-field">
              <label>Jambe dominante</label>
              <select defaultValue="">
                <option value="" disabled>Sélectionner</option>
                <option>Droite</option>
                <option>Gauche</option>
                <option>Les deux</option>
              </select>
            </div>
          </div>
        </section>

        <section className="form-section">
            <h2>Compte utilisateur</h2>

            <div className="form-grid form-grid--three">
                <div className="form-field">
                <label>Nom d'utilisateur</label>
                <input type="text" placeholder="Ex. : lea.martin" />
                </div>

                <div className="form-field">
                <label>Statut du compte</label>
                <select defaultValue="actif">
                    <option value="actif">Actif</option>
                    <option value="inactif">Inactif</option>
                    <option value="attente">En attente</option>
                </select>
                </div>

                <div className="form-field">
                <label>Date de création du compte</label>
                <input type="date" />
                </div>
            </div>
        </section>

        <section className="form-section form-section--notes">
            <h2>Historique médical et notes</h2>

            <div className="form-field full-width">
                <label>Historique des blessures et notes</label>
                <textarea placeholder="Ex. : Antécédents de blessures, interventions, recommandations particulières..." />
            </div>
        </section>

        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
          >
            Annuler
          </button>

          <button
            type="submit"
            className="btn-primary"
          >
            Créer l'athlète
          </button>
        </div>
      </form>
    </div>
  )
}
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../../styles/page-form.css'
import '../../styles/create-team.css'

const SPORT_OPTIONS = ['Rugby', 'Athlétisme', 'Soccer', 'Basketball', 'Volleyball']
const HEAD_COACH_OPTIONS = ['Samuel Gagnon', 'Camille Tremblay', 'Hugo St-Pierre']
const ASSISTANT_COACHES = ['Sophie Nadeau', 'Marc Bouchard']
const PHYSIOS = ['Mélanie Roy', 'Julie Gagnon']

export default function CreateTeamPage() {
  const navigate = useNavigate()
  const [teamName, setTeamName] = useState('')
  const [sport, setSport] = useState('')
  const [headCoach, setHeadCoach] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
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
              <select value={sport} onChange={(event) => setSport(event.target.value)}>
                <option value="">Sélectionner un sport</option>
                {SPORT_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="form-section">
          <h2>Encadrement</h2>

          <div className="form-grid form-grid--single">
            <div className="form-field full-width">
              <label>Coach principal</label>
              <select value={headCoach} onChange={(event) => setHeadCoach(event.target.value)}>
                <option value="">Sélectionner un coach</option>
                {HEAD_COACH_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div className="form-field full-width">
              <label>Coach(s) secondaire(s)</label>
              <div className="token-select" role="group" aria-label="Coachs secondaires sélectionnés">
                <div className="token-select__chips">
                  {ASSISTANT_COACHES.map((coach) => (
                    <span key={coach} className="selection-chip">
                      <span>{coach}</span>
                      <span aria-hidden="true">×</span>
                    </span>
                  ))}
                </div>
                <span className="token-select__caret" aria-hidden="true">⌄</span>
              </div>
            </div>

            <div className="form-field full-width">
              <label>Kiné(s)</label>
              <div className="token-select" role="group" aria-label="Kinés sélectionnés">
                <div className="token-select__chips">
                  {PHYSIOS.map((physio) => (
                    <span key={physio} className="selection-chip">
                      <span>{physio}</span>
                      <span aria-hidden="true">×</span>
                    </span>
                  ))}
                </div>
                <span className="token-select__caret" aria-hidden="true">⌄</span>
              </div>
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

          <button type="submit" className="btn-primary">
            Créer l&apos;équipe
          </button>
        </div>
      </form>
    </div>
  )
}
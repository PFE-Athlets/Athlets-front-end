import './styles/create-athlete.css'

export default function CreateAthletePage() {
  return (
    <div className="create-athlete-page">
      <form className="athlete-form">
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
              <label>Sport</label>

              {/* Temporaire.
                  Plus tard remplacer par un vrai multiselect */}
              <select defaultValue="">
                <option value="" disabled>Sélectionner</option>
                <option>Rugby</option>
                <option>Athlétisme</option>
                <option>Soccer</option>
                <option>Volleyball</option>
                <option>Basketball</option>
              </select>
            </div>

            <div className="form-field">
              <label>Position / Discipline</label>
              <input
                type="text"
                placeholder="Ex. : Demi de mêlée, Sprint 100m"
              />
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
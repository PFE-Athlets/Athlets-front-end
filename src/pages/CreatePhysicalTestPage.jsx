import '../styles/create-athlete.css'

export default function CreatePhysicalTestPage() {
  return (
    <div className="create-athlete-page">
      <h1>Créer un test physique</h1>

      <form className="athlete-form">
        <section className="form-section">
          <h2>Informations générales</h2>

          <div className="form-grid">
            <div className="form-field">
              <label>Nom du test *</label>
              <input type="text" placeholder="Ex. : Sprint 100 m" />
            </div>

            <div className="form-field">
              <label>Catégorie *</label>
              <select defaultValue="">
                <option value="" disabled>Sélectionner</option>
                <option value="FORCE">Force</option>
                <option value="ENDURANCE">Endurance</option>
                <option value="VITESSE">Vitesse</option>
                <option value="AGILITE">Agilité</option>
                <option value="SOUPLESSE">Souplesse</option>
              </select>
            </div>

            <div className="form-field">
              <label>Unité de mesure *</label>
              <select defaultValue="">
                <option value="" disabled>Sélectionner</option>
                <option value="SECONDES">Secondes</option>
                <option value="KILOGRAMMES">Kilogrammes</option>
                <option value="METRES">Mètres</option>
                <option value="REPETITIONS">Répétitions / Séries</option>
              </select>
            </div>

            <div className="form-field">
              <label>Preuve vidéo requise</label>
              <select defaultValue="non">
                <option value="non">Non</option>
                <option value="oui">Oui</option>
              </select>
            </div>
          </div>
        </section>

        <section className="form-section">
          <h2>Sports ciblés</h2>

          <div className="checkbox-grid">
            <label className="checkbox-field">
              <input type="checkbox" />
              <span>Rugby</span>
            </label>

            <label className="checkbox-field">
              <input type="checkbox" />
              <span>Athlétisme</span>
            </label>

            <label className="checkbox-field">
              <input type="checkbox" />
              <span>Soccer</span>
            </label>

            <label className="checkbox-field">
              <input type="checkbox" />
              <span>Basketball</span>
            </label>

            <label className="checkbox-field">
              <input type="checkbox" />
              <span>Volleyball</span>
            </label>

            <label className="checkbox-field">
              <input type="checkbox" />
              <span>Cross-country</span>
            </label>
          </div>
        </section>

        <section className="form-section form-section--notes">
          <h2>Protocole</h2>

          <div className="form-field full-width">
            <label>Description du protocole *</label>
            <textarea placeholder="Décrire les étapes à suivre pour réaliser le test, les consignes, le matériel requis et les conditions de validité..." />
          </div>
        </section>

        <section className="form-section">
          <h2>Statut</h2>

          <div className="readonly-info">
            <p>
              Le test sera automatiquement créé avec le statut <strong>ACTIF</strong>.
            </p>
            <p>
              Les dates de création et de dernière modification seront générées automatiquement par le système.
            </p>
          </div>
        </section>

        <div className="form-actions">
          <button type="button" className="btn-secondary">
            Annuler
          </button>

          <button type="submit" className="btn-primary">
            Enregistrer
          </button>
        </div>
      </form>
    </div>
  )
}
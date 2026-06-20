import '../../styles/page-form.css'

const TEST_CATEGORIES = [
  { value: 'FORCE', label: 'Force' },
  { value: 'ENDURANCE', label: 'Endurance' },
  { value: 'VITESSE', label: 'Vitesse' },
  { value: 'AGILITE', label: 'Agilité' },
  { value: 'SOUPLESSE', label: 'Souplesse' },
]

const MEASUREMENT_UNITS = [
  { value: 'SECONDES', label: 'Secondes' },
  { value: 'KILOGRAMMES', label: 'Kilogrammes' },
  { value: 'METRES', label: 'Mètres' },
  { value: 'REPETITIONS', label: 'Répétitions / Séries' },
]

const SPORTS = [
  'Rugby',
  'Athlétisme',
  'Soccer',
  'Basketball',
  'Volleyball',
  'Cross-country',
]

const BOOLEAN_OPTIONS = [
  { value: 'non', label: 'Non' },
  { value: 'oui', label: 'Oui' },
]

export default function CreatePhysicalTestPage() {
  return (
    <div className="create-page">
      <form className="entity-form">
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
                <option value="" disabled>
                  Sélectionner
                </option>

                {TEST_CATEGORIES.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label>Unité de mesure *</label>
              <select defaultValue="">
                <option value="" disabled>
                  Sélectionner
                </option>

                {MEASUREMENT_UNITS.map((unit) => (
                  <option key={unit.value} value={unit.value}>
                    {unit.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label>Preuve vidéo requise</label>
              <select defaultValue="non">
                {BOOLEAN_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="form-section">
          <h2>Sports ciblés</h2>

          <select defaultValue="">
            <option value="" disabled>
              Sélectionner
            </option>

            {TEST_CATEGORIES.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
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
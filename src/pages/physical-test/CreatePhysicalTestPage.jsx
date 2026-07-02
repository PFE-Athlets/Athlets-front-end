import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../../styles/page-form.css'
import { physicalTestService } from '../../api/physicalTestService'

const TEST_CATEGORIES = [
  { value: 'FORCE', label: 'Force' },
  { value: 'ENDURANCE', label: 'Endurance' },
  { value: 'VITESSE', label: 'Vitesse' },
  { value: 'AGILITE', label: 'Agilité' },
  { value: 'SOUPLESSE', label: 'Souplesse' },
]

const MEASUREMENT_UNITS = [
  { value: 's', label: 'Secondes' },
  { value: 'kg', label: 'Kilogrammes' },
  { value: 'm', label: 'Mètres' },
  { value: 'reps', label: 'Répétitions / Séries' },
]

const SPORTS = [
  { value: 'Rugby', label: 'Rugby' },
  { value: 'Athlétisme', label: 'Athlétisme' },
  { value: 'Soccer', label: 'Soccer' },
  { value: 'Basketball', label: 'Basketball' },
  { value: 'Volleyball', label: 'Volleyball' },
  { value: 'Cross-country', label: 'Cross-country' },
]

const BOOLEAN_OPTIONS = [
  { value: 'non', label: 'Non' },
  { value: 'oui', label: 'Oui' },
]

const INITIAL_FORM = {
  nom: '',
  categorie: '',
  unit: '',
  proof: 'non',
  sports: [],
  protocol: '',
}

export default function CreatePhysicalTestPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState(INITIAL_FORM)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const updateField = (key, value) => setFormData((prev) => ({ ...prev, [key]: value }))

  const toggleSport = (sportValue) => {
    setFormData((prev) => ({
      ...prev,
      sports: prev.sports.includes(sportValue)
        ? prev.sports.filter((s) => s !== sportValue)
        : [...prev.sports, sportValue],
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const payload = {
      testName: formData.nom,
      unit: formData.unit,
      protocol: formData.protocol,
      sportNames: formData.sports,
      proof: formData.proof,
    }

    const result = await physicalTestService.create(payload)

    if (result.success) {
      navigate('/tests-physiques')
    } else {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="create-page">
      <form className="entity-form" onSubmit={handleSubmit}>
        <section className="form-section">
          <h2>Informations générales</h2>

          <div className="form-grid">
            <div className="form-field">
              <label>Nom du test *</label>
              <input
                type="text"
                placeholder="Ex. : Sprint 100 m"
                value={formData.nom}
                onChange={(e) => updateField('nom', e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="form-field">
              <label>Catégorie *</label>
              <select
                value={formData.categorie}
                onChange={(e) => updateField('categorie', e.target.value)}
                required
                disabled={loading}
              >
                <option value="" disabled>Sélectionner</option>
                {TEST_CATEGORIES.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label>Unité de mesure *</label>
              <select
                value={formData.unit}
                onChange={(e) => updateField('unit', e.target.value)}
                required
                disabled={loading}
              >
                <option value="" disabled>Sélectionner</option>
                {MEASUREMENT_UNITS.map((unit) => (
                  <option key={unit.value} value={unit.value}>
                    {unit.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label>Preuve vidéo requise</label>
              <select
                value={formData.proof}
                onChange={(e) => updateField('proof', e.target.value)}
                disabled={loading}
              >
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

          <div className="checkbox-grid">
            {SPORTS.map((sport) => (
              <label key={sport.value} className="checkbox-field">
                <input
                  type="checkbox"
                  checked={formData.sports.includes(sport.value)}
                  onChange={() => toggleSport(sport.value)}
                  disabled={loading}
                />
                {sport.label}
              </label>
            ))}
          </div>
        </section>

        <section className="form-section form-section--notes">
          <h2>Protocole</h2>

          <div className="form-field full-width">
            <label>Description du protocole *</label>
            <textarea
              placeholder="Décrire les étapes à suivre pour réaliser le test, les consignes, le matériel requis et les conditions de validité..."
              value={formData.protocol}
              onChange={(e) => updateField('protocol', e.target.value)}
              required
              disabled={loading}
            />
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

        {error && (
          <p style={{ color: '#ef4444', fontSize: '0.9rem', margin: '0' }}>{error}</p>
        )}

        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate('/tests-physiques')}
            disabled={loading}
          >
            Annuler
          </button>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  )
}

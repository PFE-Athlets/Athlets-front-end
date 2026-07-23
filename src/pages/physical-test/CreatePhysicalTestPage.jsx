import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../../styles/page-form.css'
import { physicalTestService } from '../../api/physicalTestService'
import { DeleteIcon } from '../../components/Icons.jsx'

const createEmptyResultType = () => ({
  name: '',
  unitId: '',
})

const createEmptyEquipment = () => ({
  id: '',
  quantity: 1,
})

const INITIAL_FORM = {
  testName: '',
  physicalQualityId: '',
  protocol: '',
  informationsSup: '',
  supervised: false,
  proofRequired: false,
  resultTypes: [createEmptyResultType()],
  equipments: [],
}

export default function CreatePhysicalTestPage() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState(INITIAL_FORM)

  const [physicalQualities, setPhysicalQualities] = useState([])
  const [measurementUnits, setMeasurementUnits] = useState([])
  const [equipmentOptions, setEquipmentOptions] = useState([])

  const [optionsLoading, setOptionsLoading] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadOptions = async () => {
      setOptionsLoading(true)
      setError(null)

      const [
        qualitiesResult,
        unitsResult,
        equipmentsResult,
      ] = await Promise.all([
        physicalTestService.getPhysicalQualities(),
        physicalTestService.getUnits(),
        physicalTestService.getEquipments(),
      ])

      if (!qualitiesResult.success) {
        setError(qualitiesResult.error)
        setOptionsLoading(false)
        return
      }

      if (!unitsResult.success) {
        setError(unitsResult.error)
        setOptionsLoading(false)
        return
      }

      if (!equipmentsResult.success) {
        setError(equipmentsResult.error)
        setOptionsLoading(false)
        return
      }

      setPhysicalQualities(qualitiesResult.data ?? [])
      setMeasurementUnits(unitsResult.data ?? [])
      setEquipmentOptions(equipmentsResult.data ?? [])

      setOptionsLoading(false)
    }

    loadOptions()
  }, [])

  const updateField = (field, value) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }))
  }

  const addResultType = () => {
    setFormData((previous) => ({
      ...previous,
      resultTypes: [
        ...previous.resultTypes,
        createEmptyResultType(),
      ],
    }))
  }

  const updateResultType = (index, field, value) => {
    setFormData((previous) => ({
      ...previous,
      resultTypes: previous.resultTypes.map(
        (resultType, resultTypeIndex) =>
          resultTypeIndex === index
            ? {
                ...resultType,
                [field]: value,
              }
            : resultType,
      ),
    }))
  }

  const removeResultType = (index) => {
    setFormData((previous) => {
      if (previous.resultTypes.length === 1) {
        return previous
      }

      return {
        ...previous,
        resultTypes: previous.resultTypes.filter(
          (_, resultTypeIndex) => resultTypeIndex !== index,
        ),
      }
    })
  }

  const addEquipment = () => {
    setFormData((previous) => ({
      ...previous,
      equipments: [
        ...previous.equipments,
        createEmptyEquipment(),
      ],
    }))
  }

  const updateEquipment = (index, field, value) => {
    setFormData((previous) => ({
      ...previous,
      equipments: previous.equipments.map(
        (equipment, equipmentIndex) =>
          equipmentIndex === index
            ? {
                ...equipment,
                [field]: value,
              }
            : equipment,
      ),
    }))
  }

  const removeEquipment = (index) => {
    setFormData((previous) => ({
      ...previous,
      equipments: previous.equipments.filter(
        (_, equipmentIndex) => equipmentIndex !== index,
      ),
    }))
  }

  const validateForm = () => {
    if (!formData.testName.trim()) {
      return 'Le nom du test est obligatoire.'
    }

    if (!formData.physicalQualityId) {
      return 'La qualité physique évaluée est obligatoire.'
    }

    if (!formData.protocol.trim()) {
      return 'Le protocole est obligatoire.'
    }

    if (formData.resultTypes.length === 0) {
      return 'Ajoutez au moins un type de résultat.'
    }

    const invalidResultType = formData.resultTypes.some(
      (resultType) =>
        !resultType.name.trim() ||
        !resultType.unitId
    )

    if (invalidResultType) {
      return 'Chaque résultat doit avoir un nom et une unité de mesure.'
    }

    const invalidEquipment = formData.equipments.some(
      (equipment) =>
        !equipment.id ||
        Number(equipment.quantity) < 1,
    )

    if (invalidEquipment) {
      return 'Chaque équipement doit avoir un nom et une quantité valide.'
    }

    return null
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError(null)

    const validationError = validateForm()

    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)

    const payload = {
      testName: formData.testName.trim(),
      physicalQualityId: Number(formData.physicalQualityId),
      protocol: formData.protocol.trim(),
      informationsSup: formData.informationsSup.trim(),
      supervised: formData.supervised,
      proofRequired: formData.proofRequired,

      equipments: formData.equipments.map((equipment) => ({
        id: Number(equipment.id),
        quantity: Number(equipment.quantity),
      })),

      resultTypes: formData.resultTypes.map((resultType) => ({
        name: resultType.name.trim(),
        unitId: Number(resultType.unitId)
      })),
    }

    const result = await physicalTestService.create(payload)

    if (result.success) {
      navigate('/tests-physiques')
      return
    }

    setError(result.error)
    setLoading(false)
  }

  return (
    <div className="create-page">
      <form
        className="physical-test-form"
        onSubmit={handleSubmit}
      >
        <section className="physical-test-section">
          <div className="physical-test-section__title">
            <span>1.</span>
            <h2>Informations générales</h2>
          </div>

          <div className="physical-test-general-grid">
            <div className="physical-test-column">
              <div className="form-field">
                <label htmlFor="testName">
                  Nom du test{' '}
                  <span className="required-marker">*</span>
                </label>

                <input
                  id="testName"
                  type="text"
                  placeholder="Ex. : Squat 5 répétitions maximales"
                  value={formData.testName}
                  onChange={(event) =>
                    updateField('testName', event.target.value)
                  }
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-field">
                <label htmlFor="physicalQualityId">
                  Qualité physique évaluée{' '}
                  <span className="required-marker">*</span>
                </label>

                <select
                  id="physicalQualityId"
                  value={formData.physicalQualityId}
                  onChange={(event) =>
                    updateField(
                      'physicalQualityId',
                      event.target.value,
                    )
                  }
                  required
                  disabled={loading || optionsLoading}
                >
                  <option value="">
                    {optionsLoading
                      ? 'Chargement...'
                      : 'Sélectionner une qualité'}
                  </option>

                  {physicalQualities.map((quality) => (
                    <option
                      key={quality.id}
                      value={quality.id}
                    >
                      {quality.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                className="physical-test-text-button"
                disabled={loading}
              >
                <span aria-hidden="true">＋</span>
                Ajouter une qualité physique
              </button>

              <div className="physical-test-toggle-block">
                <p>Supervisé</p>

                <label className="physical-test-toggle">
                  <input
                    type="checkbox"
                    checked={formData.supervised}
                    onChange={(event) =>
                      updateField(
                        'supervised',
                        event.target.checked,
                      )
                    }
                    disabled={loading}
                  />

                  <span
                    className="physical-test-toggle__track"
                    aria-hidden="true"
                  />

                  <span>Ce test doit être supervisé</span>
                </label>
              </div>
            </div>

            <div className="physical-test-column">
              <div className="form-field">
                <label htmlFor="protocol">
                  Protocole{' '}
                  <span className="required-marker">*</span>
                </label>

                <textarea
                  id="protocol"
                  placeholder="Décrire le protocole et les étapes à suivre..."
                  value={formData.protocol}
                  onChange={(event) =>
                    updateField('protocol', event.target.value)
                  }
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-field">
                <label htmlFor="informationsSup">
                  Informations supplémentaires
                </label>

                <textarea
                  id="informationsSup"
                  placeholder="Si le test est supervisé, préciser le lieu, la date, l’heure ou les consignes."
                  value={formData.informationsSup}
                  onChange={(event) =>
                    updateField(
                      'informationsSup',
                      event.target.value,
                    )
                  }
                  disabled={loading}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="physical-test-section">
          <div className="physical-test-table-wrapper">
            <div className="physical-test-table physical-test-table--results">
              <div className="physical-test-table__header">
                <span />
                <span>Nom du résultat</span>
                <span>Unité de mesure</span>
                <span>Actions</span>
              </div>

              {formData.resultTypes.map((resultType, index) => (
                <div
                  className="physical-test-table__row"
                  key={`result-${index}`}
                >
                  <span
                    className="physical-test-drag-handle"
                    aria-hidden="true"
                  >
                    ⠿
                  </span>

                  <input
                    type="text"
                    placeholder="Ex. : Nombre de répétitions"
                    value={resultType.name}
                    onChange={(event) =>
                      updateResultType(
                        index,
                        'name',
                        event.target.value,
                      )
                    }
                    disabled={loading}
                  />

                  <select
                    value={resultType.unitId}
                    onChange={(event) =>
                      updateResultType(
                        index,
                        'unitId',
                        event.target.value,
                      )
                    }
                    disabled={loading || optionsLoading}
                  >
                    <option value="">
                      {optionsLoading
                        ? 'Chargement...'
                        : 'Sélectionner une unité'}
                    </option>

                    {measurementUnits.map((unit) => (
                      <option
                        key={unit.id}
                        value={unit.id}
                      >
                        {unit.name}
                        {unit.symbol ? ` (${unit.symbol})` : ''}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    className="physical-test-delete-button"
                    aria-label={`Supprimer le résultat ${index + 1}`}
                    onClick={() => removeResultType(index)}
                    disabled={
                      loading ||
                      formData.resultTypes.length === 1
                    }
                  >
                    <DeleteIcon />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="physical-test-section">
          <div className="physical-test-section__header">
            <div>
              <div className="physical-test-section__title">
                <span>3.</span>
                <h2>Équipements requis</h2>
              </div>

              <p>
                Sélectionner les équipements nécessaires pour réaliser
                ce test.
              </p>
            </div>

            <button
              type="button"
              className="physical-test-outline-button"
              onClick={addEquipment}
              disabled={loading || optionsLoading}
            >
              <span aria-hidden="true">＋</span>
              Ajouter un équipement
            </button>
          </div>

          {formData.equipments.length > 0 ? (
            <div className="physical-test-table-wrapper">
              <div className="physical-test-table physical-test-table--equipments">
                <div className="physical-test-table__header">
                  <span />
                  <span>Équipement</span>
                  <span>Quantité requise</span>
                  <span>Actions</span>
                </div>

                {formData.equipments.map((equipment, index) => (
                  <div
                    className="physical-test-table__row"
                    key={`equipment-${index}`}
                  >
                    <span
                      className="physical-test-drag-handle"
                      aria-hidden="true"
                    >
                      ⠿
                    </span>

                    <select
                      value={equipment.id}
                      onChange={(event) =>
                        updateEquipment(
                          index,
                          'id',
                          event.target.value,
                        )
                      }
                      disabled={loading || optionsLoading}
                    >
                      <option value="">
                        {optionsLoading
                          ? 'Chargement...'
                          : 'Sélectionner un équipement'}
                      </option>

                      {equipmentOptions.map((option) => (
                        <option
                          key={option.id}
                          value={option.id}
                        >
                          {option.name}
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      min="1"
                      value={equipment.quantity}
                      onChange={(event) =>
                        updateEquipment(
                          index,
                          'quantity',
                          event.target.value,
                        )
                      }
                      disabled={loading}
                    />

                    <button
                      type="button"
                      className="physical-test-delete-button"
                      aria-label={`Supprimer l’équipement ${index + 1}`}
                      onClick={() => removeEquipment(index)}
                      disabled={loading}
                    >
                      <DeleteIcon />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="physical-test-empty-state">
              Aucun équipement ajouté.
            </div>
          )}
        </section>

        <section className="physical-test-section">
          <div className="physical-test-section__title">
            <span>4.</span>
            <h2>Paramètres du test</h2>
          </div>

          <div className="physical-test-toggle-block">
            <p>Preuve requise (photo ou vidéo)</p>

            <label className="physical-test-toggle">
              <input
                type="checkbox"
                checked={formData.proofRequired}
                onChange={(event) =>
                  updateField(
                    'proofRequired',
                    event.target.checked,
                  )
                }
                disabled={loading}
              />

              <span
                className="physical-test-toggle__track"
                aria-hidden="true"
              />

              <span>
                Une preuve photo ou vidéo est requise lors de ce test.
              </span>
            </label>
          </div>
        </section>

        {error && (
          <div
            className="form-error-message"
            role="alert"
          >
            {error}
          </div>
        )}

        <div className="physical-test-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate('/tests-physiques')}
            disabled={loading}
          >
            Annuler
          </button>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading || optionsLoading}
          >
            {loading ? 'Création…' : 'Créer le test'}
          </button>
        </div>
      </form>
    </div>
  )
}
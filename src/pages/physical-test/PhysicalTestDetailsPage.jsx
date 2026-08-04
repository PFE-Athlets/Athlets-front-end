import { useEffect, useState } from 'react'
import {
  Link,
  useNavigate,
  useParams,
} from 'react-router-dom'

import { physicalTestService } from '../../api/physicalTestService'
import '../../styles/physical-test-details.css'

const DATA_TYPE_LABELS = {
  INTEGER: 'Nombre entier',
  INT: 'Nombre entier',
  DECIMAL: 'Nombre décimal',
  DOUBLE: 'Nombre décimal',
  FLOAT: 'Nombre décimal',
  TEXT: 'Texte',
  STRING: 'Texte',
  BOOLEAN: 'Oui / Non',
  DATE: 'Date',
  TIME: 'Heure',
  DURATION: 'Durée',
}

export default function PhysicalTestDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [physicalTest, setPhysicalTest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    const fetchPhysicalTest = async () => {
      setLoading(true)
      setError('')

      try {
        const result =
          await physicalTestService.getPhysicalTestById(id)

        if (cancelled) {
          return
        }

        if (!result.success) {
          setPhysicalTest(null)
          setError(
            result.error ||
              'Une erreur est survenue lors du chargement du test physique.',
          )
          return
        }

        setPhysicalTest(result.data)
      } catch (fetchError) {
        if (!cancelled) {
          console.error(
            'Erreur lors du chargement du test physique :',
            fetchError,
          )

          setPhysicalTest(null)
          setError(
            'Une erreur est survenue lors du chargement du test physique.',
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchPhysicalTest()

    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) {
    return (
      <section className="physical-test-details-page">
        <div className="physical-test-details-message">
          Chargement du test physique...
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="physical-test-details-page">
        <div className="physical-test-details-message physical-test-details-message--error">
          {error}
        </div>

        <div className="physical-test-details-error-actions">
          <button
            type="button"
            className="physical-test-details-back-btn"
            onClick={() =>
              navigate('/tests-physiques')
            }
          >
            <BackArrowIcon />
            <span>Retour à la liste</span>
          </button>
        </div>
      </section>
    )
  }

  if (!physicalTest) {
    return (
      <section className="physical-test-details-page">
        <div className="physical-test-details-message physical-test-details-message--error">
          Le test physique demandé est introuvable.
        </div>
      </section>
    )
  }

  const testName = getTestName(physicalTest)
  const physicalQuality =
    getPhysicalQualityName(physicalTest)

  const informations =
    getAdditionalInformation(physicalTest)

  const protocol = getProtocol(physicalTest)

  const resultTypes = getResultTypes(physicalTest)
  const equipments = getEquipments(physicalTest)

  return (
    <section className="physical-test-details-page">
      <header className="physical-test-details-header">
        <h1>Détail du test</h1>

        <nav
          className="physical-test-details-breadcrumb"
          aria-label="Fil d’Ariane"
        >
          <Link to="/tests-physiques">
            Tests
          </Link>

          <span aria-hidden="true">›</span>

          <span>Détail du test</span>
        </nav>
      </header>

      <section className="physical-test-details-card physical-test-details-card--general">
        <div className="physical-test-details-card__heading">
          <h2>Informations générales</h2>

          <button
            type="button"
            className="physical-test-details-back-btn"
            onClick={() =>
              navigate('/tests-physiques')
            }
          >
            <BackArrowIcon />
            <span>Retour à la liste</span>
          </button>
        </div>

        <div className="physical-test-details-general-grid">
          <div className="physical-test-details-main-info">
            <DetailsRow
              label="Nom du test"
              value={testName}
            />

            <DetailsRow
              label="Qualité physique évaluée"
              value={physicalQuality}
            />
          </div>

          <div className="physical-test-details-boolean-info">
            <BooleanRow
              label="Supervisé"
              value={physicalTest.supervised}
            />

            <BooleanRow
              label="Preuve requise"
              value={physicalTest.proofRequired}
            />
          </div>
        </div>

        <div className="physical-test-details-description-block">
          <h3>Informations supplémentaires</h3>

          <p>
            {informations ||
              'Aucune information supplémentaire.'}
          </p>
        </div>

        <div className="physical-test-details-description-block physical-test-details-description-block--last">
          <h3>Protocole</h3>

          <p>
            {protocol ||
              'Aucun protocole n’a été précisé.'}
          </p>
        </div>
      </section>

      <section className="physical-test-details-card">
        <h2>Types de résultats à mesurer</h2>

        {resultTypes.length > 0 ? (
          <div className="physical-test-details-table-wrapper">
            <table className="physical-test-details-table">
              <thead>
                <tr>
                  <th>Nom du résultat</th>
                  <th>Unité de mesure</th>
                  <th>Type de donnée</th>
                </tr>
              </thead>

              <tbody>
                {resultTypes.map(
                  (resultType, index) => (
                    <tr
                      key={
                        resultType.id ??
                        `${getResultTypeName(resultType)}-${index}`
                      }
                    >
                      <td>
                        {getResultTypeName(
                          resultType,
                        )}
                      </td>

                      <td>
                        {formatUnit(resultType)}
                      </td>

                      <td>
                        {formatDataType(
                          getResultDataType(
                            resultType,
                          ),
                        )}
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="physical-test-details-empty">
            Aucun type de résultat n’est associé à ce
            test.
          </div>
        )}
      </section>

      <section className="physical-test-details-card">
        <h2>Équipements requis</h2>

        {equipments.length > 0 ? (
          <div className="physical-test-details-table-wrapper">
            <table className="physical-test-details-table physical-test-details-equipment-table">
              <thead>
                <tr>
                  <th>Équipement</th>
                  <th>Quantité requise</th>
                </tr>
              </thead>

              <tbody>
                {equipments.map(
                  (equipment, index) => (
                    <tr
                      key={
                        equipment.id ??
                        equipment.equipmentId ??
                        index
                      }
                    >
                      <td>
                        {getEquipmentName(
                          equipment,
                        )}
                      </td>

                      <td>
                        {getEquipmentQuantity(
                          equipment,
                        )}
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="physical-test-details-empty">
            Aucun équipement requis pour ce test.
          </div>
        )}
      </section>
    </section>
  )
}

function DetailsRow({ label, value }) {
  return (
    <div className="physical-test-details-row">
      <span className="physical-test-details-row__label">
        {label}
      </span>

      <span className="physical-test-details-row__value">
        {value || 'Non spécifié'}
      </span>
    </div>
  )
}

function BooleanRow({ label, value }) {
  const active = normalizeBoolean(value)

  return (
    <div className="physical-test-details-boolean-row">
      <span className="physical-test-details-boolean-row__label">
        {label}
      </span>

      <span
        className={
          active
            ? 'physical-test-details-status physical-test-details-status--yes'
            : 'physical-test-details-status physical-test-details-status--no'
        }
      >
        {active ? 'Oui' : 'Non'}
      </span>
    </div>
  )
}

function normalizeBoolean(value) {
  if (typeof value === 'boolean') {
    return value
  }

  if (typeof value === 'number') {
    return value === 1
  }

  if (typeof value === 'string') {
    return [
      'true',
      '1',
      'oui',
      'yes',
    ].includes(value.trim().toLowerCase())
  }

  return false
}

function getTestName(test) {
  return (
    test?.name ??
    test?.testName ??
    test?.nomTest ??
    'Test sans nom'
  )
}

function getPhysicalQualityName(test) {
  return (
    test?.physicalQuality?.name ??
    test?.physicalQuality?.physicalQualityName ??
    test?.physicalQualityName ??
    test?.quality?.name ??
    test?.qualityName ??
    'Non spécifiée'
  )
}

function getAdditionalInformation(test) {
  return (
    test?.informations ??
    test?.informationsSup ??
    test?.additionalInformation ??
    test?.description ??
    ''
  )?.trim()
}

function getProtocol(test) {
  return (
    test?.protocol ??
    test?.protocole ??
    ''
  )?.trim()
}

function getResultTypes(test) {
  const values =
    test?.resultTypes ??
    test?.typesResultat ??
    test?.resultTypeList ??
    []

  return Array.isArray(values) ? values : []
}

function getEquipments(test) {
  const values =
    test?.equipments ??
    test?.equipmentList ??
    test?.testEquipments ??
    []

  return Array.isArray(values) ? values : []
}

function getResultTypeName(resultType) {
  return (
    resultType?.name ??
    resultType?.resultName ??
    resultType?.nom ??
    'Résultat non spécifié'
  )
}

function getResultDataType(resultType) {
  return (
    resultType?.dataType ??
    resultType?.typeData ??
    resultType?.typeDonnee ??
    resultType?.type
  )
}

function formatDataType(value) {
  if (!value) {
    return 'Non spécifié'
  }

  const normalizedValue = String(value)
    .trim()
    .toUpperCase()

  return (
    DATA_TYPE_LABELS[normalizedValue] ??
    value
  )
}

function formatUnit(resultType) {
  const unit =
    resultType?.unit ??
    resultType?.unitMeasure ??
    resultType?.measurementUnit ??
    {}

  const name =
    unit?.name ??
    unit?.nom ??
    resultType?.unitName ??
    resultType?.measurementUnitName

  const symbol =
    unit?.symbol ??
    unit?.symbole ??
    resultType?.unitSymbol ??
    resultType?.measurementUnitSymbol

  if (name && symbol) {
    return `${name} (${symbol})`
  }

  return name || symbol || 'Non spécifiée'
}

function getEquipmentName(equipment) {
  return (
    equipment?.name ??
    equipment?.equipmentName ??
    equipment?.nomEquipement ??
    equipment?.equipment?.name ??
    equipment?.equipment?.equipmentName ??
    equipment?.equipment?.nomEquipement ??
    'Équipement non spécifié'
  )
}

function getEquipmentQuantity(equipment) {
  return (
    equipment?.quantity ??
    equipment?.quantityRequired ??
    equipment?.quantiteRequise ??
    equipment?.testEquipment?.quantityRequired ??
    1
  )
}

function BackArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </svg>
  )
}
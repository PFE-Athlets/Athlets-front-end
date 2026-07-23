import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { physicalTestService } from '../../api/physicalTestService'
import '../../styles/physical-test-details.css'

import {
  CalendarDateIcon,
  TargetIcon,
  TrophyIcon,
  ShieldIcon,
} from '../../components/Icons'

const DATA_TYPE_LABELS = {
  INTEGER: 'Nombre entier',
  DECIMAL: 'Nombre décimal',
  TEXT: 'Texte',
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
    const fetchPhysicalTest = async () => {
      setLoading(true)
      setError('')

      const result = await physicalTestService.getById(id)

      if (!result.success) {
        setError(
          result.error ||
            'Une erreur est survenue lors du chargement du test physique.',
        )
        setLoading(false)
        return
      }

      setPhysicalTest(result.data)
      setLoading(false)
    }

    fetchPhysicalTest()
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

        <div className="physical-test-details-actions">
          <button
            type="button"
            className="physical-test-details-btn physical-test-details-btn--secondary"
            onClick={() => navigate('/tests-physiques')}
          >
            Retour
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

  const physicalQuality =
    physicalTest.physicalQuality?.name ??
    physicalTest.physicalQualityName ??
    physicalTest.quality?.name ??
    'Non spécifiée'

  const resultTypes = Array.isArray(physicalTest.resultTypes)
    ? physicalTest.resultTypes
    : []

  const equipments = Array.isArray(physicalTest.equipments)
    ? physicalTest.equipments
    : []

  return (
    <section className="physical-test-details-page">
      <div className="physical-test-details-card">
        <section className="physical-test-details-section">
          <h2>Informations générales</h2>

          <div className="physical-test-details-grid physical-test-details-grid--two">
            <InfoItem
              icon={<TrophyIcon />}
              label="Nom du test"
              value={physicalTest.testName}
            />

            <InfoItem
              icon={<TargetIcon />}
              label="Qualité physique évaluée"
              value={physicalQuality}
            />

            <InfoItem
              icon={<ShieldIcon />}
              label="Test supervisé"
              value={
                <BooleanBadge
                  value={physicalTest.supervised}
                  trueLabel="Oui"
                  falseLabel="Non"
                />
              }
            />

            <InfoItem
              icon={<ShieldIcon />}
              label="Preuve requise"
              value={
                <BooleanBadge
                  value={physicalTest.proofRequired}
                  trueLabel="Photo ou vidéo requise"
                  falseLabel="Aucune preuve requise"
                />
              }
            />

            {physicalTest.createdAt && (
              <InfoItem
                icon={<CalendarDateIcon />}
                label="Date de création"
                value={formatDateTime(physicalTest.createdAt)}
              />
            )}

            {physicalTest.updatedAt && (
              <InfoItem
                icon={<CalendarDateIcon />}
                label="Dernière modification"
                value={formatDateTime(physicalTest.updatedAt)}
              />
            )}
          </div>
        </section>

        <section className="physical-test-details-section">
          <h2>Protocole</h2>

          <div className="physical-test-details-text-block">
            {physicalTest.protocol?.trim() ||
              'Aucun protocole n’a été précisé.'}
          </div>
        </section>

        <section className="physical-test-details-section">
          <h2>Informations supplémentaires</h2>

          <div
            className={`physical-test-details-text-block ${
              !physicalTest.informationsSup?.trim()
                ? 'physical-test-details-text-block--empty'
                : ''
            }`}
          >
            {physicalTest.informationsSup?.trim() ||
              'Aucune information supplémentaire.'}
          </div>
        </section>

        <section className="physical-test-details-section">
          <div className="physical-test-details-section__header">
            <div>
              <h2>Types de résultats à mesurer</h2>

              <p className="physical-test-details-section__description">
                Valeurs qui doivent être saisies lors de la réalisation du
                test.
              </p>
            </div>
          </div>

          {resultTypes.length > 0 ? (
            <div className="physical-test-details-results">
              {resultTypes.map((resultType, index) => (
                <article
                  key={resultType.id ?? `${resultType.name}-${index}`}
                  className="physical-test-details-result"
                >
                  <ResultField
                    label="Nom du résultat"
                    value={resultType.name}
                  />

                  <ResultField
                    label="Unité de mesure"
                    value={formatUnit(resultType)}
                  />

                  <ResultField
                    label="Type de donnée"
                    value={formatDataType(resultType.dataType)}
                  />
                </article>
              ))}
            </div>
          ) : (
            <div className="physical-test-details-empty">
              Aucun type de résultat n’est associé à ce test.
            </div>
          )}
        </section>

        <section className="physical-test-details-section">
          <div className="physical-test-details-section__header">
            <div>
              <h2>Équipements requis</h2>

              <p className="physical-test-details-section__description">
                Matériel nécessaire pour réaliser le test.
              </p>
            </div>
          </div>

          {equipments.length > 0 ? (
            <div className="physical-test-details-equipment-list">
              {equipments.map((equipment, index) => (
                <article
                  key={equipment.id ?? index}
                  className="physical-test-details-equipment"
                >
                  <div
                    className="physical-test-details-equipment__icon"
                    aria-hidden="true"
                  >
                    <EquipmentIcon />
                  </div>

                  <div className="physical-test-details-equipment__content">
                    <p className="physical-test-details-equipment__name">
                      {getEquipmentName(equipment)}
                    </p>

                    <p className="physical-test-details-equipment__quantity">
                      Quantité requise
                    </p>
                  </div>

                  <span className="physical-test-details-equipment__badge">
                    {equipment.quantity ?? 1}
                  </span>
                </article>
              ))}
            </div>
          ) : (
            <div className="physical-test-details-empty">
              Aucun équipement requis pour ce test.
            </div>
          )}
        </section>

        <div className="physical-test-details-actions">
          <button
            type="button"
            className="physical-test-details-btn physical-test-details-btn--secondary"
            onClick={() => navigate(-1)}
          >
            Retour
          </button>

          <button
            type="button"
            className="physical-test-details-btn physical-test-details-btn--primary"
            onClick={() =>
              navigate(`/tests-physiques/${id}/modifier`)
            }
          >
            Modifier le test
          </button>
        </div>
      </div>
    </section>
  )
}

function InfoItem({ icon, label, value }) {
  return (
    <article className="physical-test-details-info">
      <div
        className="physical-test-details-info__icon"
        aria-hidden="true"
      >
        {icon}
      </div>

      <div>
        <p className="physical-test-details-info__label">
          {label}
        </p>

        <div className="physical-test-details-info__value">
          {value || 'Non spécifié'}
        </div>
      </div>
    </article>
  )
}

function ResultField({ label, value }) {
  return (
    <div className="physical-test-details-result__field">
      <p className="physical-test-details-result__label">
        {label}
      </p>

      <p className="physical-test-details-result__value">
        {value || 'Non spécifié'}
      </p>
    </div>
  )
}

function BooleanBadge({
  value,
  trueLabel,
  falseLabel,
}) {
  return (
    <span
      className={`physical-test-details-badge ${
        value
          ? 'physical-test-details-badge--success'
          : 'physical-test-details-badge--neutral'
      }`}
    >
      {value ? trueLabel : falseLabel}
    </span>
  )
}

function formatDataType(value) {
  if (!value) {
    return 'Non spécifié'
  }

  const normalizedValue = String(value).trim().toUpperCase()

  return DATA_TYPE_LABELS[normalizedValue] ?? value
}

function formatUnit(resultType) {
  const unit = resultType.unit ?? {}

  const name =
    unit.name ??
    resultType.unitName ??
    resultType.measurementUnit?.name

  const symbol =
    unit.symbol ??
    resultType.unitSymbol ??
    resultType.measurementUnit?.symbol

  if (name && symbol) {
    return `${name} (${symbol})`
  }

  return name || symbol || 'Non spécifiée'
}

function getEquipmentName(equipment) {
  return (
    equipment.name ??
    equipment.equipmentName ??
    equipment.equipment?.name ??
    'Équipement non spécifié'
  )
}

function formatDateTime(value) {
  if (!value) {
    return 'Non spécifiée'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('fr-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

function EquipmentIcon() {
  return (
    <svg
      className="physical-test-details-svg-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 7v10" />
      <path d="M18 7v10" />
      <path d="M3 9v6" />
      <path d="M21 9v6" />
      <path d="M6 12h12" />
    </svg>
  )
}
import { useEffect, useMemo, useState } from 'react'
import {
  useNavigate,
  useParams,
} from 'react-router-dom'
import { physicalTestService } from '../../api/physicalTestService'
import '../../styles/batterie-test-details.css'

const getBatterieName = (battery) => {
  return (
    battery?.name ??
    battery?.batteryName ??
    battery?.batterieName ??
    battery?.nomBatterie ??
    'Batterie sans nom'
  )
}

const getTeamName = (battery) => {
  return (
    battery?.team?.name ??
    battery?.team?.teamName ??
    battery?.teamName ??
    battery?.equipeName ??
    battery?.nomEquipe ??
    ''
  )
}

const getBatteryStatus = (battery) => {
  const status =
    battery?.status ??
    battery?.batteryStatus ??
    battery?.batterieStatus

  if (
    status === true ||
    status === 1 ||
    String(status).toLowerCase() === 'true' ||
    String(status).toUpperCase() === 'ACTIVE'
  ) {
    return {
      label: 'Active',
      active: true,
    }
  }

  if (
    status === false ||
    status === 0 ||
    String(status).toLowerCase() === 'false' ||
    String(status).toUpperCase() === 'INACTIVE'
  ) {
    return {
      label: 'Inactive',
      active: false,
    }
  }

  return {
    label: 'Non spécifié',
    active: false,
  }
}

const getPhysicalTests = (battery) => {
  if (Array.isArray(battery?.physicalTests)) {
    return battery.physicalTests
  }

  if (Array.isArray(battery?.tests)) {
    return battery.tests
  }

  if (Array.isArray(battery?.testList)) {
    return battery.testList
  }

  if (Array.isArray(battery?.testsPhysiques)) {
    return battery.testsPhysiques
  }

  return []
}

const getPhysicalTestId = (test) => {
  return String(
    test?.id ??
      test?.testId ??
      test?.physicalTestId ??
      '',
  )
}

const getPhysicalTestName = (test) => {
  return (
    test?.name ??
    test?.testName ??
    test?.nomTest ??
    'Test physique sans nom'
  )
}

const getPhysicalQualityName = (test) => {
  return (
    test?.physicalQuality?.name ??
    test?.physicalQuality?.physicalQualityName ??
    test?.physicalQualityName ??
    test?.qualityName ??
    test?.qualitePhysique ??
    'Non spécifiée'
  )
}

const getBooleanValue = (...values) => {
  const value = values.find(
    (candidate) =>
      candidate !== undefined &&
      candidate !== null,
  )

  if (typeof value === 'boolean') {
    return value
  }

  if (typeof value === 'number') {
    return value === 1
  }

  if (typeof value === 'string') {
    return (
      value.toLowerCase() === 'true' ||
      value === '1'
    )
  }

  return false
}

const getSupervisedValue = (test) => {
  return getBooleanValue(
    test?.supervised,
    test?.isSupervised,
    test?.supervise,
  )
}

const getProofRequiredValue = (test) => {
  return getBooleanValue(
    test?.proofRequired,
    test?.isProofRequired,
    test?.preuveRequise,
  )
}

export default function BatterieTestDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [battery, setBattery] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    const fetchBattery = async () => {
      setLoading(true)
      setError('')

      try {
        const result =
          await physicalTestService.getDisplayBatterieById(
            id,
          )

        if (cancelled) {
          return
        }

        if (!result.success) {
          setBattery(null)
          setError(
            result.error ??
              'Une erreur est survenue lors du chargement de la batterie.',
          )
          return
        }

        setBattery(result.data)
      } catch (loadError) {
        if (!cancelled) {
          console.error(
            'Erreur lors du chargement de la batterie :',
            loadError,
          )

          setBattery(null)
          setError(
            'Impossible de charger la batterie de tests.',
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchBattery()

    return () => {
      cancelled = true
    }
  }, [id])

  const physicalTests = useMemo(
    () => getPhysicalTests(battery),
    [battery],
  )

  if (loading) {
    return (
      <section className="battery-details-page">
        <div className="battery-details-message">
          Chargement de la batterie de tests...
        </div>
      </section>
    )
  }

  if (error || !battery) {
    return (
      <section className="battery-details-page">
        <div className="battery-details-message battery-details-message--error">
          {error || 'Batterie de tests introuvable.'}
        </div>

        <div className="battery-details-actions">
          <button
            type="button"
            className="battery-details-button battery-details-button--secondary"
            onClick={() =>
              navigate('/batterie-tests')
            }
          >
            Retour à la liste
          </button>
        </div>
      </section>
    )
  }

  const batteryName = getBatterieName(battery)
  const teamName = getTeamName(battery)
  const status = getBatteryStatus(battery)

  return (
    <section className="battery-details-page">
      <h1 className="battery-details-title">
        Détail de la batterie
      </h1>

      <section className="battery-details-card">
        <h2 className="battery-details-card__title">
          Informations générales
        </h2>

        <div className="battery-details-info">
          <InfoRow
            label="Nom de la batterie"
            value={batteryName}
          />

          <InfoRow
            label="Équipe"
            value={teamName || 'Aucune équipe'}
          />

          <InfoRow
            label="Statut"
            value={
              <span
                className={
                  status.active
                    ? 'battery-details-status battery-details-status--active'
                    : 'battery-details-status battery-details-status--inactive'
                }
              >
                {status.label}
              </span>
            }
            last
          />
        </div>
      </section>

      <section className="battery-details-card">
        <h2 className="battery-details-card__title">
          Tests associés
        </h2>

        {physicalTests.length > 0 ? (
          <div className="battery-details-table-wrapper">
            <table className="battery-details-table">
              <thead>
                <tr>
                  <th>Nom du test</th>
                  <th>Qualité physique</th>
                  <th>Supervisé</th>
                  <th>Preuve requise</th>
                </tr>
              </thead>

              <tbody>
                {physicalTests.map(
                  (test, index) => {
                    const testId =
                      getPhysicalTestId(test)

                    return (
                      <tr
                        key={
                          testId ||
                          `${getPhysicalTestName(test)}-${index}`
                        }
                      >
                        <td>
                          {testId ? (
                            <button
                              type="button"
                              className="battery-details-test-link"
                              onClick={() =>
                                navigate(
                                  `/tests-physiques/${testId}`,
                                )
                              }
                            >
                              {getPhysicalTestName(test)}
                            </button>
                          ) : (
                            getPhysicalTestName(test)
                          )}
                        </td>

                        <td>
                          {getPhysicalQualityName(
                            test,
                          )}
                        </td>

                        <td>
                          <BooleanBadge
                            value={getSupervisedValue(
                              test,
                            )}
                          />
                        </td>

                        <td>
                          <BooleanBadge
                            value={getProofRequiredValue(
                              test,
                            )}
                          />
                        </td>
                      </tr>
                    )
                  },
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="battery-details-empty">
            Aucun test physique n’est associé à cette
            batterie.
          </div>
        )}
      </section>

      <div className="battery-details-actions">
        <button
          type="button"
          className="battery-details-button battery-details-button--secondary"
          onClick={() =>
            navigate('/batterie-tests')
          }
        >
          Retour à la liste
        </button>

        <button
          type="button"
          className="battery-details-button battery-details-button--primary"
          onClick={() =>
            navigate(
              `/batterie-tests/${id}/modifier`,
            )
          }
        >
          Modifier
        </button>
      </div>
    </section>
  )
}

function InfoRow({ label, value, last = false }) {
  return (
    <div
      className={`battery-details-info-row${
        last
          ? ' battery-details-info-row--last'
          : ''
      }`}
    >
      <div className="battery-details-info-row__label">
        {label}
      </div>

      <div className="battery-details-info-row__value">
        {value || 'Non spécifié'}
      </div>
    </div>
  )
}

function BooleanBadge({ value }) {
  return (
    <span
      className={
        value
          ? 'battery-details-boolean battery-details-boolean--yes'
          : 'battery-details-boolean battery-details-boolean--no'
      }
    >
      {value ? 'Oui' : 'Non'}
    </span>
  )
}
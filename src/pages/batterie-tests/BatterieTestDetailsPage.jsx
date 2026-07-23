import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { batterieTestsService } from '../../api/batterieTestsService'
import '../../styles/athlete-details.css'

import {
  CalendarDateIcon,
  TeamIcon,
  TrophyIcon,
  TargetIcon,
  ShieldIcon,
} from '../../components/Icons'

const STATUS_CONFIG = {
  ACTIVE: {
    label: 'Active',
    className: 'athlete-profile-status--active',
  },
  INACTIVE: {
    label: 'Inactive',
    className: 'athlete-profile-status--inactive',
  },
}

const getBatterieId = (battery) => {
  return String(
    battery?.id ??
      battery?.batteryId ??
      battery?.batterieId ??
      battery?.testBatteryId ??
      '',
  )
}

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

const getStatus = (battery) => {
  const status =
    battery?.status ??
    battery?.batteryStatus ??
    battery?.batterieStatus ??
    ''

  return String(status).trim().toUpperCase()
}

const getCreatedDate = (battery) => {
  return (
    battery?.createdAt ??
    battery?.creationDate ??
    battery?.createdDate ??
    battery?.dateCreation ??
    ''
  )
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

const getSupervisedValue = (test) => {
  return Boolean(
    test?.supervised ??
      test?.isSupervised ??
      test?.supervise,
  )
}

const getProofRequiredValue = (test) => {
  return Boolean(
    test?.proofRequired ??
      test?.isProofRequired ??
      test?.preuveRequise,
  )
}

const formatDate = (value) => {
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
          await batterieTestsService.getById(id)

        if (cancelled) {
          return
        }

        if (!result.success) {
          console.error(
            'Erreur lors du chargement de la batterie de tests :',
            result.error,
          )

          setBattery(null)
          setError(
            result.error ||
              'Une erreur est survenue lors du chargement de la batterie.',
          )
          return
        }

        setBattery(result.data)
      } catch (loadError) {
        if (!cancelled) {
          console.error(
            'Erreur lors du chargement de la batterie de tests :',
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

  const batteryName = getBatterieName(battery)
  const teamName = getTeamName(battery)
  const statusKey = getStatus(battery)
  const creationDate = getCreatedDate(battery)

  const statusConfig = STATUS_CONFIG[statusKey] ?? {
    label: statusKey || 'Non spécifié',
    className: 'athlete-profile-status--inactive',
  }

  if (loading) {
    return (
      <section className="athlete-profile-page">
        <div className="athlete-profile-message">
          Chargement de la batterie de tests...
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="athlete-profile-page">
        <div className="athlete-profile-message athlete-profile-message--error">
          {error}
        </div>

        <div className="athlete-profile-actions">
          <button
            type="button"
            className="athlete-profile-btn athlete-profile-btn--secondary"
            onClick={() => navigate('/batterie-tests')}
          >
            Retour
          </button>
        </div>
      </section>
    )
  }

  if (!battery) {
    return (
      <section className="athlete-profile-page">
        <div className="athlete-profile-message athlete-profile-message--error">
          Batterie de tests introuvable.
        </div>

        <div className="athlete-profile-actions">
          <button
            type="button"
            className="athlete-profile-btn athlete-profile-btn--secondary"
            onClick={() => navigate('/batterie-tests')}
          >
            Retour
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="athlete-profile-page">
      <div className="athlete-profile-card">
        <section className="athlete-profile-section">
          <h2>Informations générales</h2>

          <div className="athlete-profile-grid athlete-profile-grid--two">
            <InfoItem
              icon={<TrophyIcon />}
              label="Nom de la batterie"
              value={batteryName}
            />

            <InfoItem
              icon={<TeamIcon />}
              label="Équipe associée"
              value={teamName || 'Aucune équipe'}
            />

            <InfoItem
              icon={<ShieldIcon />}
              label="Statut"
              value={
                <span
                  className={`athlete-profile-status ${statusConfig.className}`}
                >
                  {statusConfig.label}
                </span>
              }
            />

            <InfoItem
              icon={<TargetIcon />}
              label="Nombre de tests"
              value={`${physicalTests.length} test(s)`}
            />

            {creationDate ? (
              <InfoItem
                icon={<CalendarDateIcon />}
                label="Date de création"
                value={formatDate(creationDate)}
              />
            ) : null}
          </div>
        </section>

        <section className="athlete-profile-section">
          <h2>Tests physiques associés</h2>

          {physicalTests.length > 0 ? (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nom du test</th>
                    <th>Qualité physique</th>
                    <th>Supervisé</th>
                    <th>Preuve requise</th>
                  </tr>
                </thead>

                <tbody>
                  {physicalTests.map((test, index) => {
                    const testId =
                      getPhysicalTestId(test)

                    const supervised =
                      getSupervisedValue(test)

                    const proofRequired =
                      getProofRequiredValue(test)

                    return (
                      <tr
                        key={
                          testId ||
                          `${getPhysicalTestName(test)}-${index}`
                        }
                      >
                        <td className="cell--name">
                          {testId ? (
                            <button
                              type="button"
                              className="athlete-profile-table-link"
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
                          {getPhysicalQualityName(test)}
                        </td>

                        <td>
                          <BooleanBadge value={supervised} />
                        </td>

                        <td>
                          <BooleanBadge
                            value={proofRequired}
                          />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="athlete-profile-notes">
              Aucun test physique n’est associé à cette
              batterie.
            </div>
          )}
        </section>

        <div className="athlete-profile-actions">
          <button
            type="button"
            className="athlete-profile-btn athlete-profile-btn--secondary"
            onClick={() => navigate(-1)}
          >
            Retour
          </button>
        </div>
      </div>
    </section>
  )
}

function InfoItem({ icon, label, value }) {
  return (
    <article className="athlete-profile-info">
      <div
        className="athlete-profile-info__icon"
        aria-hidden="true"
      >
        {icon}
      </div>

      <div>
        <p className="athlete-profile-info__label">
          {label}
        </p>

        <div className="athlete-profile-info__value">
          {value || 'Non spécifié'}
        </div>
      </div>
    </article>
  )
}

function BooleanBadge({ value }) {
  return value ? (
    <span className="badge badge--blue">
      Oui
    </span>
  ) : (
    <span className="cell--muted">
      Non
    </span>
  )
}
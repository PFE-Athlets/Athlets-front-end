import { useEffect, useMemo, useState } from 'react'
import {
  useNavigate,
  useParams,
} from 'react-router-dom'

import { physicalTestService } from '../../api/physicalTestService'
import { teamService } from '../../api/teamService'

import '../../styles/edit-batterie-test.css'

const normalizePhysicalTests = (data) => {
  if (Array.isArray(data)) {
    return data
  }

  if (Array.isArray(data?.physicalTests)) {
    return data.physicalTests
  }

  if (Array.isArray(data?.tests)) {
    return data.tests
  }

  if (Array.isArray(data?.content)) {
    return data.content
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

const getBatteryTests = (battery) => {
  if (Array.isArray(battery?.physicalTests)) {
    return battery.physicalTests
  }

  if (Array.isArray(battery?.tests)) {
    return battery.tests
  }

  if (Array.isArray(battery?.testList)) {
    return battery.testList
  }

  return []
}

const getBatteryStatus = (battery) => {
  const status =
    battery?.status ??
    battery?.batteryStatus ??
    battery?.batterieStatus

  return (
    status === true ||
    status === 1 ||
    String(status).toLowerCase() === 'true' ||
    String(status).toUpperCase() === 'ACTIVE'
  )
}

const getBatteryTeamId = (battery) => {
  return String(
    battery?.team?.id ??
      battery?.team?.teamId ??
      battery?.teamId ??
      '',
  )
}

export default function EditBatterieTestPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [teamId, setTeamId] = useState('')
  const [status, setStatus] = useState('true')

  const [teams, setTeams] = useState([])
  const [physicalTests, setPhysicalTests] =
    useState([])

  const [existingTests, setExistingTests] =
    useState([])

  const [addedTests, setAddedTests] = useState([])
  const [testToAddId, setTestToAddId] =
    useState('')

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] =
    useState(false)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    let cancelled = false

    const loadPageData = async () => {
      setLoading(true)
      setError('')

      try {
        const [
          batteryResult,
          teamsResult,
          testsResult,
        ] = await Promise.all([
          physicalTestService.getDisplayBatterieById(
            id,
          ),
          teamService.getDisplayTeams(),
          physicalTestService.getAll(),
        ])

        if (cancelled) {
          return
        }

        if (!batteryResult.success) {
          setError(
            batteryResult.error ??
              'Impossible de charger la batterie de tests.',
          )
          return
        }

        const battery = batteryResult.data

        setName(
          battery?.name ??
            battery?.batteryName ??
            battery?.batterieName ??
            '',
        )

        setTeamId(getBatteryTeamId(battery))

        setStatus(
          getBatteryStatus(battery)
            ? 'true'
            : 'false',
        )

        setExistingTests(
          getBatteryTests(battery),
        )

        if (teamsResult.success) {
          setTeams(
            Array.isArray(teamsResult.data)
              ? teamsResult.data
              : [],
          )
        } else {
          setTeams([])
        }

        if (testsResult.success) {
          setPhysicalTests(
            normalizePhysicalTests(
              testsResult.data,
            ),
          )
        } else {
          setPhysicalTests([])
        }
      } catch (loadError) {
        console.error(
          'Erreur lors du chargement de la page :',
          loadError,
        )

        if (!cancelled) {
          setError(
            'Impossible de charger les informations de la batterie.',
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadPageData()

    return () => {
      cancelled = true
    }
  }, [id])

  const existingTestIds = useMemo(() => {
    return existingTests
      .map(getPhysicalTestId)
      .filter(Boolean)
  }, [existingTests])

  const addedTestIds = useMemo(() => {
    return addedTests
      .map(getPhysicalTestId)
      .filter(Boolean)
  }, [addedTests])

  const allDisplayedTests = useMemo(() => {
    return [
      ...existingTests.map((test) => ({
        ...test,
        associationState: 'existing',
      })),
      ...addedTests.map((test) => ({
        ...test,
        associationState: 'added',
      })),
    ]
  }, [existingTests, addedTests])

  const availableTests = useMemo(() => {
    return physicalTests.filter((test) => {
      const testId = getPhysicalTestId(test)

      return (
        testId &&
        !existingTestIds.includes(testId) &&
        !addedTestIds.includes(testId)
      )
    })
  }, [
    physicalTests,
    existingTestIds,
    addedTestIds,
  ])

  const handleAddTest = () => {
    if (!testToAddId) {
      return
    }

    const selectedTest = physicalTests.find(
      (test) =>
        getPhysicalTestId(test) ===
        testToAddId,
    )

    if (!selectedTest) {
      return
    }

    setAddedTests((currentTests) => [
      ...currentTests,
      selectedTest,
    ])

    setTestToAddId('')
  }

  const handleRemoveAddedTest = (testId) => {
    setAddedTests((currentTests) =>
      currentTests.filter(
        (test) =>
          getPhysicalTestId(test) !== testId,
      ),
    )
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    setError('')
    setSuccess('')

    const trimmedName = name.trim()

    if (!trimmedName) {
      setError(
        'Veuillez saisir un nom pour la batterie.',
      )
      return
    }

    if (!teamId) {
      setError(
        'Veuillez sélectionner une équipe.',
      )
      return
    }

    setSubmitting(true)

    try {
      const payload = {
        name: trimmedName,
        teamId: Number(teamId),
        status: status === 'true',

        // On transmet tous les tests qui doivent
        // rester associés à la batterie.
        physicalTestIds: [
          ...existingTestIds,
          ...addedTestIds,
        ].map(Number),
      }

      const result =
        await physicalTestService.updateBattery(
          id,
          payload,
        )

      if (!result.success) {
        setError(
          result.error ??
            'Impossible de modifier la batterie de tests.',
        )
        return
      }

      setSuccess(
        'La batterie de tests a été modifiée avec succès.',
      )

      setTimeout(() => {
        navigate(`/batterie-tests/${id}`)
      }, 1200)
    } catch (submitError) {
      console.error(
        'Erreur lors de la modification :',
        submitError,
      )

      setError(
        'Une erreur inattendue s’est produite.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <section className="edit-battery-page">
        <div className="edit-battery-message">
          Chargement de la batterie de tests...
        </div>
      </section>
    )
  }

  if (error && !name) {
    return (
      <section className="edit-battery-page">
        <div className="edit-battery-message edit-battery-message--error">
          {error}
        </div>

        <div className="edit-battery-actions">
          <button
            type="button"
            className="edit-battery-button edit-battery-button--secondary"
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

  return (
    <section className="edit-battery-page">
      <header className="edit-battery-header">
        <h1>Modifier une batterie de tests</h1>

        <p>
          Modifiez les informations de la
          batterie et ajoutez de nouveaux tests
          si nécessaire.
        </p>
      </header>

      <form
        className="edit-battery-card"
        onSubmit={handleSubmit}
      >
        <section className="edit-battery-section">
          <h2>Informations générales</h2>

          <div className="edit-battery-grid">
            <div className="edit-battery-field">
              <label htmlFor="battery-name">
                Nom de la batterie
                <span aria-hidden="true"> *</span>
              </label>

              <input
                id="battery-name"
                type="text"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                disabled={submitting}
                required
              />
            </div>

            <div className="edit-battery-field">
              <label htmlFor="battery-team">
                Équipe
                <span aria-hidden="true"> *</span>
              </label>

              <select
                id="battery-team"
                value={teamId}
                onChange={(event) =>
                  setTeamId(event.target.value)
                }
                disabled={submitting}
                required
              >
                <option value="">
                  Sélectionner une équipe
                </option>

                {teams.map((team) => (
                  <option
                    key={team.id}
                    value={team.id}
                  >
                    {team.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="edit-battery-field">
              <label htmlFor="battery-status">
                Statut
                <span aria-hidden="true"> *</span>
              </label>

              <select
                id="battery-status"
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value)
                }
                disabled={submitting}
              >
                <option value="true">
                  Active
                </option>

                <option value="false">
                  Inactive
                </option>
              </select>
            </div>
          </div>
        </section>

        <section className="edit-battery-section edit-battery-section--tests">
          <h2>Tests associés</h2>

          <div
            className="edit-battery-warning"
            role="note"
          >
            <span
              className="edit-battery-warning__icon"
              aria-hidden="true"
            >
              △
            </span>

            <p>
              <strong>Attention :</strong> vous
              pouvez seulement ajouter des tests
              à cette batterie. Les tests déjà
              associés ne peuvent pas être
              retirés.
            </p>
          </div>

          <div className="edit-battery-add-test">
            <div className="edit-battery-field">
              <label htmlFor="test-to-add">
                Ajouter un test
              </label>

              <select
                id="test-to-add"
                value={testToAddId}
                onChange={(event) =>
                  setTestToAddId(
                    event.target.value,
                  )
                }
                disabled={
                  submitting ||
                  availableTests.length === 0
                }
              >
                <option value="">
                  {availableTests.length === 0
                    ? 'Aucun test disponible'
                    : 'Rechercher ou sélectionner un test'}
                </option>

                {availableTests.map((test) => {
                  const testId =
                    getPhysicalTestId(test)

                  return (
                    <option
                      key={testId}
                      value={testId}
                    >
                      {getPhysicalTestName(test)}
                    </option>
                  )
                })}
              </select>
            </div>

            <button
              type="button"
              className="edit-battery-add-button"
              onClick={handleAddTest}
              disabled={
                !testToAddId || submitting
              }
            >
              Ajouter le test
            </button>
          </div>

          <div className="edit-battery-table-wrapper">
            <table className="edit-battery-table">
              <thead>
                <tr>
                  <th>Nom du test</th>
                  <th>Qualité physique</th>
                  <th>Supervisé</th>
                  <th>Preuve requise</th>
                  <th>État</th>
                </tr>
              </thead>

              <tbody>
                {allDisplayedTests.map(
                  (test, index) => {
                    const testId =
                      getPhysicalTestId(test)

                    const isExisting =
                      test.associationState ===
                      'existing'

                    return (
                      <tr
                        key={
                          testId ||
                          `${getPhysicalTestName(test)}-${index}`
                        }
                      >
                        <td className="edit-battery-table__name">
                          {getPhysicalTestName(
                            test,
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

                        <td>
                          {isExisting ? (
                            <span className="edit-battery-state edit-battery-state--existing">
                              Déjà associé
                            </span>
                          ) : (
                            <div className="edit-battery-added-state">
                              <span className="edit-battery-state edit-battery-state--added">
                                Nouveau
                              </span>

                              <button
                                type="button"
                                className="edit-battery-remove-button"
                                onClick={() =>
                                  handleRemoveAddedTest(
                                    testId,
                                  )
                                }
                                disabled={
                                  submitting
                                }
                                aria-label={`Retirer ${getPhysicalTestName(test)}`}
                              >
                                ×
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  },
                )}

                {allDisplayedTests.length ===
                0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="edit-battery-table__empty"
                    >
                      Aucun test physique
                      associé.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>

        {error ? (
          <div
            className="edit-battery-feedback edit-battery-feedback--error"
            role="alert"
          >
            {error}
          </div>
        ) : null}

        {success ? (
          <div
            className="edit-battery-feedback edit-battery-feedback--success"
            role="status"
          >
            {success}
          </div>
        ) : null}

        <div className="edit-battery-actions">
          <button
            type="button"
            className="edit-battery-button edit-battery-button--secondary"
            onClick={() => navigate(-1)}
            disabled={submitting}
          >
            Annuler
          </button>

          <button
            type="submit"
            className="edit-battery-button edit-battery-button--primary"
            disabled={
              submitting || Boolean(success)
            }
          >
            {submitting
              ? 'Enregistrement...'
              : 'Enregistrer les modifications'}
          </button>
        </div>
      </form>
    </section>
  )
}

function BooleanBadge({ value }) {
  return (
    <span
      className={
        value
          ? 'edit-battery-boolean edit-battery-boolean--yes'
          : 'edit-battery-boolean edit-battery-boolean--no'
      }
    >
      {value ? 'Oui' : 'Non'}
    </span>
  )
}
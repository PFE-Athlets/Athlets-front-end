import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../../styles/page-form.css'
import { PlusIcon } from '../../components/Icons'
import { teamService } from '../../api/teamService'
import { physicalTestService } from '../../api/physicalTestService'
import { batterieTestsService } from '../../api/batterieTestsService'

const STATUS_OPTIONS = [
  {
    value: 'ACTIVE',
    label: 'Active',
  },
  {
    value: 'INACTIVE',
    label: 'Inactive',
  },
]

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

export default function CreateBatterieTestPage() {
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [teamId, setTeamId] = useState('')
  const [status, setStatus] = useState('ACTIVE')

  const [teams, setTeams] = useState([])
  const [physicalTests, setPhysicalTests] = useState([])
  const [selectedTests, setSelectedTests] = useState([])
  const [testToAddId, setTestToAddId] = useState('')

  const [teamsLoading, setTeamsLoading] = useState(true)
  const [testsLoading, setTestsLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [teamsError, setTeamsError] = useState(null)
  const [testsError, setTestsError] = useState(null)
  const [submitError, setSubmitError] = useState(null)
  const [submitSuccess, setSubmitSuccess] = useState('')

  useEffect(() => {
    let cancelled = false

    const loadTeams = async () => {
      setTeamsLoading(true)
      setTeamsError(null)

      try {
        const result = await teamService.getDisplayTeams()

        if (cancelled) {
          return
        }

        if (result.success) {
          setTeams(
            Array.isArray(result.data)
              ? result.data
              : [],
          )
        } else {
          setTeams([])
          setTeamsError(
            result.error ??
              'Impossible de charger les équipes.',
          )
        }
      } catch (error) {
        if (!cancelled) {
          console.error(
            'Erreur lors du chargement des équipes :',
            error,
          )

          setTeams([])
          setTeamsError(
            'Impossible de charger les équipes.',
          )
        }
      } finally {
        if (!cancelled) {
          setTeamsLoading(false)
        }
      }
    }

    loadTeams()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    const loadPhysicalTests = async () => {
      setTestsLoading(true)
      setTestsError(null)

      try {
        const result = await physicalTestService.getAll()

        if (cancelled) {
          return
        }

        if (result.success) {
          setPhysicalTests(
            normalizePhysicalTests(result.data),
          )
        } else {
          setPhysicalTests([])
          setTestsError(
            result.error ??
              'Impossible de charger les tests physiques.',
          )
        }
      } catch (error) {
        if (!cancelled) {
          console.error(
            'Erreur lors du chargement des tests physiques :',
            error,
          )

          setPhysicalTests([])
          setTestsError(
            'Impossible de charger les tests physiques.',
          )
        }
      } finally {
        if (!cancelled) {
          setTestsLoading(false)
        }
      }
    }

    loadPhysicalTests()

    return () => {
      cancelled = true
    }
  }, [])

  const selectedTestIds = useMemo(() => {
    return selectedTests.map(getPhysicalTestId)
  }, [selectedTests])

  const availableTests = useMemo(() => {
    return physicalTests.filter((test) => {
      const testId = getPhysicalTestId(test)

      return (
        testId &&
        !selectedTestIds.includes(testId)
      )
    })
  }, [physicalTests, selectedTestIds])

  const isFormLocked =
    submitting || Boolean(submitSuccess)

  const handleAddTest = () => {
    if (!testToAddId) {
      return
    }

    const testToAdd = physicalTests.find(
      (test) =>
        getPhysicalTestId(test) === testToAddId,
    )

    if (!testToAdd) {
      return
    }

    setSelectedTests((previousTests) => {
      const alreadySelected = previousTests.some(
        (test) =>
          getPhysicalTestId(test) === testToAddId,
      )

      if (alreadySelected) {
        return previousTests
      }

      return [...previousTests, testToAdd]
    })

    setTestToAddId('')
  }

  const handleRemoveTest = (testId) => {
    setSelectedTests((previousTests) =>
      previousTests.filter(
        (test) =>
          getPhysicalTestId(test) !== testId,
      ),
    )
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (submitSuccess) {
      return
    }

    setSubmitError(null)
    setSubmitSuccess('')

    const trimmedName = name.trim()

    if (!trimmedName) {
      setSubmitError(
        'Veuillez saisir un nom pour la batterie de tests.',
      )
      return
    }

    if (!teamId) {
      setSubmitError(
        'Veuillez sélectionner une équipe.',
      )
      return
    }

    if (selectedTests.length === 0) {
      setSubmitError(
        'Veuillez ajouter au moins un test physique.',
      )
      return
    }

    setSubmitting(true)

    try {
      const result =
        await batterieTestsService.create({
          name: trimmedName,
          teamId: Number(teamId),
          status,
          physicalTestIds: selectedTests.map(
            (test) =>
              Number(getPhysicalTestId(test)),
          ),
        })

      if (!result.success) {
        setSubmitError(
          result.error ??
            'Impossible de créer la batterie de tests.',
        )
        return
      }

      setSubmitSuccess(
        'La batterie de tests a été créée avec succès.',
      )
    } catch (error) {
      console.error(
        'Erreur lors de la création de la batterie de tests :',
        error,
      )

      setSubmitError(
        'Impossible de créer la batterie de tests.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="create-page">
      <form
        className="entity-form"
        onSubmit={handleSubmit}
      >
        <section className="form-section">
          <h2>Informations générales</h2>

          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="battery-name">
                Nom de la batterie
                <span className="required-marker">
                  {' '}*
                </span>
              </label>

              <input
                id="battery-name"
                type="text"
                placeholder="Ex. : Batterie pré-saison 2026"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                disabled={isFormLocked}
              />
            </div>

            <div className="form-field">
              <label htmlFor="battery-team">
                Équipe
                <span className="required-marker">
                  {' '}*
                </span>
              </label>

              <select
                id="battery-team"
                value={teamId}
                onChange={(event) =>
                  setTeamId(event.target.value)
                }
                disabled={
                  teamsLoading ||
                  teams.length === 0 ||
                  isFormLocked
                }
              >
                <option value="">
                  {teamsLoading
                    ? 'Chargement des équipes...'
                    : 'Sélectionner une équipe'}
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

              {teamsError ? (
                <p className="form-field__error">
                  {teamsError}
                </p>
              ) : null}
            </div>

            <div className="form-field full-width">
              <label htmlFor="battery-status">
                Statut
                <span className="required-marker">
                  {' '}*
                </span>
              </label>

              <select
                id="battery-status"
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value)
                }
                disabled={isFormLocked}
              >
                {STATUS_OPTIONS.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="form-section">
          <h2>Tests associés</h2>

          <div className="form-section-content">
            <div className="form-inline-action">
              <div className="form-field">
                <label htmlFor="physical-test">
                  Ajouter un test
                </label>

                <select
                  id="physical-test"
                  value={testToAddId}
                  onChange={(event) =>
                    setTestToAddId(event.target.value)
                  }
                  disabled={
                    testsLoading ||
                    availableTests.length === 0 ||
                    isFormLocked
                  }
                >
                  <option value="">
                    {testsLoading
                      ? 'Chargement des tests...'
                      : availableTests.length === 0
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

                {testsError ? (
                  <p className="form-field__error">
                    {testsError}
                  </p>
                ) : null}
              </div>

              <button
                type="button"
                className="form-outline-button"
                onClick={handleAddTest}
                disabled={
                  !testToAddId || isFormLocked
                }
              >
                <PlusIcon />
                <span>Ajouter le test</span>
              </button>
            </div>

            <div className="form-table-wrapper">
              <div className="form-table form-table--battery">
                <div className="form-table__header">
                  <span aria-hidden="true" />
                  <span>Nom du test</span>
                  <span>Qualité physique</span>
                  <span>Supervisé</span>
                  <span>Preuve requise</span>
                  <span>Action</span>
                </div>

                {selectedTests.length > 0 ? (
                  selectedTests.map((test) => {
                    const testId =
                      getPhysicalTestId(test)

                    const supervised =
                      getSupervisedValue(test)

                    const proofRequired =
                      getProofRequiredValue(test)

                    return (
                      <div
                        key={testId}
                        className="form-table__row"
                      >
                        <span
                          className="form-drag-handle"
                          aria-hidden="true"
                        >
                          ⠿
                        </span>

                        <span className="form-table__cell form-table__cell--name">
                          {getPhysicalTestName(test)}
                        </span>

                        <span className="form-table__cell">
                          {getPhysicalQualityName(test)}
                        </span>

                        <span className="form-table__cell">
                          <span
                            className={
                              supervised
                                ? 'boolean-badge boolean-badge--yes'
                                : 'boolean-badge boolean-badge--no'
                            }
                          >
                            {supervised
                              ? 'Oui'
                              : 'Non'}
                          </span>
                        </span>

                        <span className="form-table__cell">
                          {proofRequired
                            ? 'Oui'
                            : 'Non'}
                        </span>

                        <button
                          type="button"
                          className="form-delete-button"
                          onClick={() =>
                            handleRemoveTest(testId)
                          }
                          disabled={isFormLocked}
                          aria-label={`Retirer ${getPhysicalTestName(test)}`}
                        >
                          <span aria-hidden="true">
                            ×
                          </span>
                        </button>
                      </div>
                    )
                  })
                ) : (
                  <div className="form-table-empty">
                    Aucun test physique ajouté.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {submitError ? (
          <p
            className="form-error-message"
            role="alert"
          >
            {submitError}
          </p>
        ) : null}

        {submitSuccess ? (
          <section
            className="success-section"
            role="status"
            aria-live="polite"
          >
            <div className="success-section__content">
              <span
                className="success-section__icon"
                aria-hidden="true"
              >
                ✓
              </span>

              <div>
                <h2>Succès</h2>
                <p>{submitSuccess}</p>
              </div>
            </div>

            <button
              type="button"
              className="btn-secondary"
              onClick={() =>
                navigate('/batterie-tests')
              }
            >
              Retour aux batteries de tests
            </button>
          </section>
        ) : null}

        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate(-1)}
            disabled={isFormLocked}
          >
            Annuler
          </button>

          <button
            type="submit"
            className="btn-primary"
            disabled={isFormLocked}
          >
            {submitting
              ? 'Création...'
              : 'Créer la batterie'}
          </button>
        </div>
      </form>
    </div>
  )
}
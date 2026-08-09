import {
  useMemo,
  useState,
} from 'react'
import {
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom'

import { resultService } from '../../api/resultService'

import '../../styles/create-result-multiple-athletes.css'

const getAthleteName = (athlete) => {
  if (!athlete) {
    return 'Athlète'
  }

  if (athlete.fullName) {
    return athlete.fullName
  }

  if (athlete.displayName) {
    return athlete.displayName
  }

  return [
    athlete.firstName,
    athlete.lastName,
  ]
    .filter(Boolean)
    .join(' ') || 'Athlète'
}

const getAthleteInitials = (athlete) => {
  const firstName =
    athlete?.firstName ?? ''

  const lastName =
    athlete?.lastName ?? ''

  const displayName =
    athlete?.displayName ??
    athlete?.fullName ??
    ''

  const initials = [
    firstName.charAt(0),
    lastName.charAt(0),
  ]
    .filter(Boolean)
    .join('')
    .toUpperCase()

  if (initials) {
    return initials
  }

  const words =
    displayName
      .trim()
      .split(/\s+/)
      .filter(Boolean)

  if (words.length > 0) {
    return words
      .slice(0, 2)
      .map((word) =>
        word.charAt(0),
      )
      .join('')
      .toUpperCase()
  }

  return 'A'
}

const getTestName = (test) =>
  test?.name ??
  test?.testName ??
  'Test'

const getTestCategory = (test) => {
  const quality =
    test?.physicalQuality

  if (typeof quality === 'string') {
    return quality
  }

  if (quality?.name) {
    return quality.name
  }

  return (
    test?.category ??
    test?.quality ??
    test?.sport ??
    ''
  )
}

const getResultTypeId = (
  resultValue,
) =>
  resultValue?.resultType?.id ??
  resultValue?.resultTypeId ??
  null

const getExistingResultValue = (
  result,
  resultTypeId,
) =>
  result?.resultValues?.find(
    (value) =>
      String(
        getResultTypeId(value),
      ) ===
      String(resultTypeId),
  )

const buildInitialResults = (
  assignedResults,
  resultTypes,
) =>
  assignedResults.reduce(
    (accumulator, assignedResult) => {
      const resultId =
        String(
          assignedResult.id,
        )

      accumulator[resultId] = {
        resultId:
          assignedResult.id,

        athlete:
          assignedResult.athlete,

        values:
          resultTypes.map(
            (resultType) => {
              const existingValue =
                getExistingResultValue(
                  assignedResult,
                  resultType.id,
                )

              return {
                resultTypeId:
                  resultType.id,

                value:
                  existingValue?.value ??
                  '',
              }
            },
          ),

        proof:
          assignedResult.proof ??
          '',

        comment:
          assignedResult.comment ??
          assignedResult.commentText ??
          '',
      }

      return accumulator
    },
    {},
  )

export default function CreateResultMultipleAthletesPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const context =
    location.state ?? null

  const test =
    context?.test ?? null

  const team =
    context?.team ?? null

  const testDate =
    context?.testDate ?? ''

  /*
   * Les vrais Result créés lors de
   * l'assignation de la batterie.
   */
  const assignedResults =
    Array.isArray(
      context?.results,
    )
      ? context.results
      : []

  /*
   * Les vrais ResultType du test.
   */
  const resultTypes =
    useMemo(
      () =>
        Array.isArray(
          test?.resultTypes,
        )
          ? test.resultTypes
          : [],
      [test],
    )

  /*
   * État de saisie indexé par Result.id.
   */
  const [
    athleteResults,
    setAthleteResults,
  ] = useState(() =>
    buildInitialResults(
      assignedResults,
      resultTypes,
    ),
  )

  const [error, setError] =
    useState('')

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false)

  const testName =
    getTestName(test)

  const testCategory =
    getTestCategory(test)

  const teamName =
    team?.name ?? '—'

  const athleteCount =
    assignedResults.length

  /*
   * Nombre d'athlètes dont toutes les
   * valeurs requises sont remplies.
   */
  const completedCount =
    useMemo(
      () =>
        assignedResults.filter(
          (assignedResult) => {
            const currentResult =
              athleteResults[
                String(
                  assignedResult.id,
                )
              ]

            if (
              !currentResult ||
              currentResult.values
                .length === 0
            ) {
              return false
            }

            return currentResult.values.every(
              (resultValue) =>
                resultValue.value !== '' &&
                resultValue.value !== null &&
                resultValue.value !== undefined &&
                Number.isFinite(
                  Number(
                    resultValue.value,
                  ),
                ),
            )
          },
        ).length,
      [
        assignedResults,
        athleteResults,
      ],
    )

  if (
    !context ||
    !test ||
    !team ||
    assignedResults.length === 0
  ) {
    return (
      <Navigate
        to="/resultats/creer"
        replace
      />
    )
  }

  /*
   * Modification d'une valeur spécifique
   * pour un ResultType spécifique.
   */
  const updateResultValue = (
    resultId,
    resultTypeId,
    value,
  ) => {
    const normalizedResultId =
      String(resultId)

    setAthleteResults(
      (currentResults) => ({
        ...currentResults,

        [normalizedResultId]: {
          ...currentResults[
            normalizedResultId
          ],

          values:
            currentResults[
              normalizedResultId
            ].values.map(
              (resultValue) =>
                String(
                  resultValue
                    .resultTypeId,
                ) ===
                String(
                  resultTypeId,
                )
                  ? {
                      ...resultValue,
                      value,
                    }
                  : resultValue,
            ),
        },
      }),
    )

    setError('')
  }

  /*
   * Modification preuve/commentaire.
   */
  const updateResultField = (
    resultId,
    field,
    value,
  ) => {
    const normalizedResultId =
      String(resultId)

    setAthleteResults(
      (currentResults) => ({
        ...currentResults,

        [normalizedResultId]: {
          ...currentResults[
            normalizedResultId
          ],

          [field]: value,
        },
      }),
    )

    setError('')
  }

  const handleBack = () => {
    navigate(
      '/resultats/creer',
      {
        state: context,
      },
    )
  }

  const validateForm = () => {
    if (
      resultTypes.length === 0
    ) {
      return 'Aucun type de résultat n’est configuré pour ce test.'
    }

    for (
      const assignedResult
      of assignedResults
    ) {
      const currentResult =
        athleteResults[
          String(
            assignedResult.id,
          )
        ]

      const athleteName =
        getAthleteName(
          assignedResult.athlete,
        )

      if (!currentResult) {
        return `Impossible de trouver le résultat de ${athleteName}.`
      }

      const hasMissingValue =
        currentResult.values.some(
          (resultValue) =>
            resultValue.value === '' ||
            resultValue.value === null ||
            resultValue.value === undefined,
        )

      if (hasMissingValue) {
        return `Veuillez saisir toutes les valeurs pour ${athleteName}.`
      }

      const hasInvalidValue =
        currentResult.values.some(
          (resultValue) =>
            !Number.isFinite(
              Number(
                resultValue.value,
              ),
            ),
        )

      if (hasInvalidValue) {
        return `Les valeurs saisies pour ${athleteName} doivent être numériques.`
      }

      if (
        (
          currentResult.comment ??
          ''
        ).length > 500
      ) {
        return `Le commentaire de ${athleteName} ne peut pas dépasser 500 caractères.`
      }

      if (
        currentResult.proof?.trim() &&
        !/^https?:\/\/.+/i.test(
          currentResult.proof.trim(),
        )
      ) {
        return `Le lien de preuve de ${athleteName} doit commencer par http:// ou https://.`
      }

      if (
        test?.proofRequired &&
        !currentResult.proof
          ?.trim()
      ) {
        return `Une preuve est requise pour ${athleteName}.`
      }
    }

    return ''
  }

  const handleSubmit = async () => {
    setError('')

    const validationError =
      validateForm()

    if (validationError) {
      setError(
        validationError,
      )

      return
    }

    setIsSubmitting(true)

    try {
      /*
       * Un appel /submit par Result.
       *
       * Le backend décide automatiquement
       * du statut selon l'utilisateur
       * authentifié.
       */
      for (
        const assignedResult
        of assignedResults
      ) {
        const currentResult =
          athleteResults[
            String(
              assignedResult.id,
            )
          ]

        const payload = {
          id:
            assignedResult.id,

          testDate,

          proof:
            currentResult.proof
              ?.trim() ||
            null,

          comment:
            currentResult.comment
              ?.trim() ||
            null,

          resultValues:
            currentResult.values.map(
              (resultValue) => ({
                resultTypeId:
                  Number(
                    resultValue
                      .resultTypeId,
                  ),

                value:
                  Number(
                    resultValue
                      .value,
                  ),
              }),
            ),
        }

        const response =
          await resultService.submit(
            payload,
          )

        if (!response.success) {
          setError(
            response.error ??
              `Impossible d’enregistrer le résultat de ${getAthleteName(
                assignedResult.athlete,
              )}.`,
          )

          return
        }
      }

      navigate('/resultats')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="create-multiple-result-page">
      {/* =========================
          Topbar
          ========================= */}
      <div className="create-multiple-result-page__topbar">
        <div className="create-multiple-result-steps">
          <div className="create-multiple-result-step">
            <span className="create-multiple-result-step__number">
              1
            </span>

            <span>
              Sélection
            </span>
          </div>

          <div className="create-multiple-result-step__line" />

          <div className="create-multiple-result-step create-multiple-result-step--active">
            <span className="create-multiple-result-step__number">
              2
            </span>

            <span>
              Résultats – Plusieurs athlètes
            </span>
          </div>
        </div>

        <button
          type="button"
          className="create-multiple-result-page__back"
          onClick={() =>
            navigate('/resultats')
          }
        >
          <span aria-hidden="true">
            ←
          </span>

          Retour aux tests
        </button>
      </div>

      {/* =========================
          Carte principale
          ========================= */}
      <section className="create-multiple-result-card">
        {error && (
          <div className="create-multiple-result-error">
            {error}
          </div>
        )}

        {/* =========================
            1. Rappel
            ========================= */}
        <div className="create-multiple-result-section">
          <h2>
            1. Rappel de la sélection
          </h2>

          <div className="create-multiple-result-summary">
            <div className="create-multiple-result-summary__item">
              <span className="create-multiple-result-summary__label">
                Test sélectionné
              </span>

              <div className="create-multiple-result-summary__test">
                <strong>
                  {testName}
                </strong>

                {testCategory && (
                  <span className="create-multiple-result-summary__tag">
                    {testCategory}
                  </span>
                )}
              </div>
            </div>

            <div className="create-multiple-result-summary__item">
              <span className="create-multiple-result-summary__label">
                Équipe
              </span>

              <strong className="create-multiple-result-summary__value">
                {teamName}
              </strong>
            </div>

            <div className="create-multiple-result-summary__item">
              <span className="create-multiple-result-summary__label">
                Athlètes
              </span>

              <strong className="create-multiple-result-summary__value">
                {athleteCount}{' '}

                {athleteCount > 1
                  ? 'athlètes sélectionnés'
                  : 'athlète sélectionné'}
              </strong>
            </div>
          </div>
        </div>

        {/* =========================
            2. Saisie
            ========================= */}
        <div className="create-multiple-result-section create-multiple-result-section--last">
          <h2>
            2. Saisie des résultats
          </h2>

          <p className="create-multiple-result-section__description">
            Entrez les résultats pour chaque
            athlète ayant effectué ce test.
          </p>

          <div className="create-multiple-result-table-wrapper">
            <div className="create-multiple-result-table">
              {/* Header */}
              <div className="create-multiple-result-table__header">
                <div>
                  Athlète
                </div>

                <div>
                  Résultat
                </div>

                <div>
                  Unité
                </div>

                <div>
                  Preuve
                </div>

                <div>
                  Commentaire
                </div>
              </div>

              {/* Rows */}
              {assignedResults.map(
                (assignedResult) => {
                  const resultId =
                    String(
                      assignedResult.id,
                    )

                  const athlete =
                    assignedResult.athlete

                  const result =
                    athleteResults[
                      resultId
                    ]

                  return (
                    <div
                      key={
                        resultId
                      }
                      className="create-multiple-result-table__row"
                    >
                      {/* Athlète */}
                      <div className="create-multiple-result-athlete">
                        <div className="create-multiple-result-athlete__avatar">
                          {getAthleteInitials(
                            athlete,
                          )}
                        </div>

                        <div className="create-multiple-result-athlete__info">
                          <strong>
                            {getAthleteName(
                              athlete,
                            )}
                          </strong>

                          {athlete?.username && (
                            <span>
                              {
                                athlete.username
                              }
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Valeurs */}
                      <div>
                        {resultTypes.map(
                          (resultType) => {
                            const resultValue =
                              result?.values
                                ?.find(
                                  (value) =>
                                    String(
                                      value
                                        .resultTypeId,
                                    ) ===
                                    String(
                                      resultType.id,
                                    ),
                                )

                            return (
                              <div
                                key={
                                  resultType.id
                                }
                                style={{
                                  marginBottom:
                                    resultTypes.length >
                                    1
                                      ? '8px'
                                      : '0',
                                }}
                              >
                                {resultTypes.length >
                                  1 && (
                                  <div
                                    style={{
                                      fontSize:
                                        '12px',
                                      marginBottom:
                                        '4px',
                                    }}
                                  >
                                    {
                                      resultType.name
                                    }
                                  </div>
                                )}

                                <input
                                  type="number"
                                  step="any"
                                  className="create-multiple-result-value-input"
                                  value={
                                    resultValue
                                      ?.value ??
                                    ''
                                  }
                                  placeholder="0"
                                  onChange={(
                                    event,
                                  ) =>
                                    updateResultValue(
                                      assignedResult.id,
                                      resultType.id,
                                      event
                                        .target
                                        .value,
                                    )
                                  }
                                />
                              </div>
                            )
                          },
                        )}
                      </div>

                      {/* Unités */}
                      <div>
                        {resultTypes.map(
                          (resultType) => (
                            <div
                              key={
                                resultType.id
                              }
                              className="create-multiple-result-unit"
                              style={{
                                marginBottom:
                                  resultTypes.length >
                                  1
                                    ? '8px'
                                    : '0',
                              }}
                            >
                              {resultType
                                .unitSymbol ??
                                resultType
                                  .unitName ??
                                '—'}
                            </div>
                          ),
                        )}
                      </div>

                      {/* Preuve */}
                      <div>
                        <input
                          type="url"
                          className="create-multiple-result-comment"
                          value={
                            result?.proof ??
                            ''
                          }
                          placeholder={
                            test?.proofRequired
                              ? 'Preuve requise'
                              : 'Lien de preuve...'
                          }
                          onChange={(
                            event,
                          ) =>
                            updateResultField(
                              assignedResult.id,
                              'proof',
                              event
                                .target
                                .value,
                            )
                          }
                        />
                      </div>

                      {/* Commentaire */}
                      <div>
                        <input
                          type="text"
                          maxLength={500}
                          className="create-multiple-result-comment"
                          value={
                            result?.comment ??
                            ''
                          }
                          placeholder="Ajouter un commentaire..."
                          onChange={(
                            event,
                          ) =>
                            updateResultField(
                              assignedResult.id,
                              'comment',
                              event
                                .target
                                .value,
                            )
                          }
                        />
                      </div>
                    </div>
                  )
                },
              )}
            </div>
          </div>

          {/* Progression */}
          <div className="create-multiple-result-progress">
            <span>
              {completedCount}{' '}
              sur{' '}
              {athleteCount}{' '}
              résultats saisis
            </span>

            <div className="create-multiple-result-progress__track">
              <div
                className="create-multiple-result-progress__bar"
                style={{
                  width:
                    athleteCount > 0
                      ? `${(
                          completedCount /
                          athleteCount
                        ) * 100}%`
                      : '0%',
                }}
              />
            </div>
          </div>
        </div>

        {/* =========================
            Actions
            ========================= */}
        <div className="create-multiple-result-actions">
          <button
            type="button"
            className="create-multiple-result-button create-multiple-result-button--secondary"
            onClick={
              handleBack
            }
            disabled={
              isSubmitting
            }
          >
            Retour
          </button>

          <button
            type="button"
            className="create-multiple-result-button create-multiple-result-button--primary"
            onClick={
              handleSubmit
            }
            disabled={
              isSubmitting
            }
          >
            {isSubmitting
              ? 'Enregistrement...'
              : 'Enregistrer et finaliser'}
          </button>
        </div>
      </section>
    </div>
  )
}
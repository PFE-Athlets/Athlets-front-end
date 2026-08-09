import {
  useMemo,
  useState,
} from 'react'
import {
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom'

import '../../styles/create-result-multiple-athletes.css'

const RESULT_STATUS = {
  APPROVED: 'APPROVED',
  PENDING: 'PENDING',
  REJECTED: 'REJECTED',
}

const STATUS_OPTIONS = [
  {
    value: RESULT_STATUS.APPROVED,
    label: 'Approuvé',
  },
  {
    value: RESULT_STATUS.PENDING,
    label: 'En attente',
  },
  {
    value: RESULT_STATUS.REJECTED,
    label: 'Refusé',
  },
]

const getAthleteName = (athlete) => {
  if (athlete?.fullName) {
    return athlete.fullName
  }

  return [
    athlete?.firstName,
    athlete?.lastName,
  ]
    .filter(Boolean)
    .join(' ') || 'Athlète'
}

const getAthleteInitials = (athlete) => {
  const firstName =
    athlete?.firstName ?? ''

  const lastName =
    athlete?.lastName ?? ''

  const initials = [
    firstName.charAt(0),
    lastName.charAt(0),
  ]
    .filter(Boolean)
    .join('')
    .toUpperCase()

  return initials || 'A'
}

const getTestName = (test) =>
  test?.name ??
  test?.testName ??
  'Test'

const getTestUnit = (test) =>
  test?.unit ??
  test?.measurementUnit ??
  test?.unite ??
  '—'

const getTestCategory = (test) =>
  test?.category ??
  test?.quality ??
  test?.physicalQuality ??
  test?.sport ??
  ''

const buildInitialResults = (
  athletes,
) =>
  athletes.reduce(
    (accumulator, athlete) => {
      const id = String(
        athlete.id,
      )

      accumulator[id] = {
        value: '',
        status:
          RESULT_STATUS.APPROVED,
        comment: '',
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

  const athletes =
    Array.isArray(
      context?.athletes,
    )
      ? context.athletes
      : []

  const [
    athleteResults,
    setAthleteResults,
  ] = useState(() =>
    buildInitialResults(
      athletes,
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

  const testUnit =
    getTestUnit(test)

  const testCategory =
    getTestCategory(test)

  const teamName =
    team?.name ?? '—'

  const athleteCount =
    athletes.length

  const completedCount =
    useMemo(
      () =>
        athletes.filter(
          (athlete) => {
            const id =
              String(
                athlete.id,
              )

            const value =
              athleteResults[id]
                ?.value

            return (
              value !== '' &&
              Number.isFinite(
                Number(value),
              )
            )
          },
        ).length,
      [
        athletes,
        athleteResults,
      ],
    )

  if (
    !context ||
    !test ||
    !team ||
    athletes.length === 0
  ) {
    return (
      <Navigate
        to="/resultats/creer"
        replace
      />
    )
  }

  const updateAthleteResult = (
    athleteId,
    field,
    value,
  ) => {
    const id =
      String(athleteId)

    setAthleteResults(
      (currentResults) => ({
        ...currentResults,

        [id]: {
          ...currentResults[id],
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
    const missingResults =
      athletes.filter(
        (athlete) => {
          const result =
            athleteResults[
              String(
                athlete.id,
              )
            ]

          return (
            !result ||
            result.value === ''
          )
        },
      )

    if (
      missingResults.length > 0
    ) {
      return 'Veuillez saisir un résultat pour chaque athlète.'
    }

    const invalidResults =
      athletes.filter(
        (athlete) => {
          const value =
            athleteResults[
              String(
                athlete.id,
              )
            ]?.value

          return !Number.isFinite(
            Number(value),
          )
        },
      )

    if (
      invalidResults.length > 0
    ) {
      return 'Tous les résultats doivent être des valeurs numériques.'
    }

    const invalidComments =
      athletes.some(
        (athlete) =>
          (
            athleteResults[
              String(
                athlete.id,
              )
            ]?.comment ?? ''
          ).length > 500,
      )

    if (invalidComments) {
      return 'Les commentaires ne peuvent pas dépasser 500 caractères.'
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

    const payload = {
      testId: test.id,
      teamId: team.id,
      resultDate: testDate,

      results:
        athletes.map(
          (athlete) => {
            const athleteId =
              String(
                athlete.id,
              )

            const result =
              athleteResults[
                athleteId
              ]

            return {
              athleteId:
                athlete.id,

              username:
                athlete.username,

              value:
                Number(
                  result.value,
                ),

              unit:
                testUnit,

              status:
                result.status,

              comment:
                result.comment
                  ?.trim() ||
                null,
            }
          },
        ),
    }

    try {
      /*
       * À brancher plus tard sur resultService.
       *
       * Exemple :
       *
       * const response =
       *   await resultService
       *     .createMultiple(payload)
       *
       * if (!response.success) {
       *   setError(response.error)
       *   return
       * }
       *
       * navigate('/resultats')
       */

      console.log(
        'Résultats multiples à enregistrer :',
        payload,
      )
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
            navigate(
              '/resultats',
            )
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
            Entrez les résultats pour chaque athlète ayant effectué ce test.
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
                  Statut
                </div>

                <div>
                  Commentaire
                </div>
              </div>

              {/* Rows */}
              {athletes.map(
                (athlete) => {
                  const athleteId =
                    String(
                      athlete.id,
                    )

                  const result =
                    athleteResults[
                      athleteId
                    ]

                  return (
                    <div
                      key={
                        athleteId
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

                          {athlete.username && (
                            <span>
                              {
                                athlete.username
                              }
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Résultat */}
                      <div>
                        <input
                          type="number"
                          step="any"
                          className="create-multiple-result-value-input"
                          value={
                            result?.value ??
                            ''
                          }
                          placeholder="0"
                          onChange={(
                            event,
                          ) =>
                            updateAthleteResult(
                              athleteId,
                              'value',
                              event
                                .target
                                .value,
                            )
                          }
                        />
                      </div>

                      {/* Unité */}
                      <div>
                        <div className="create-multiple-result-unit">
                          {
                            testUnit
                          }
                        </div>
                      </div>

                      {/* Statut */}
                      <div>
                        <select
                          className={`create-multiple-result-status create-multiple-result-status--${
                            (
                              result?.status ??
                              RESULT_STATUS.APPROVED
                            ).toLowerCase()
                          }`}
                          value={
                            result?.status ??
                            RESULT_STATUS.APPROVED
                          }
                          onChange={(
                            event,
                          ) =>
                            updateAthleteResult(
                              athleteId,
                              'status',
                              event
                                .target
                                .value,
                            )
                          }
                        >
                          {STATUS_OPTIONS.map(
                            (
                              option,
                            ) => (
                              <option
                                key={
                                  option.value
                                }
                                value={
                                  option.value
                                }
                              >
                                {
                                  option.label
                                }
                              </option>
                            ),
                          )}
                        </select>
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
                            updateAthleteResult(
                              athleteId,
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
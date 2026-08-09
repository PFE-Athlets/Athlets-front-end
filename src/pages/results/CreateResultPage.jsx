import {
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useNavigate } from 'react-router-dom'

import { teamService } from '../../api/teamService'
import { resultService } from '../../api/resultService'
import { physicalTestService } from '../../api/physicalTestService'
import { athleteService } from '../../api/athleteService'

import '../../styles/create-result.css'

const SELECTION_MODE = {
  ONE: 'ONE',
  MULTIPLE: 'MULTIPLE',
  ALL: 'ALL',
}

const getToday = () => {
  const date = new Date()

  const year = date.getFullYear()

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, '0')

  const day = String(
    date.getDate(),
  ).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const getAthleteName = (athlete) => {
  if (athlete?.fullName) {
    return athlete.fullName
  }

  if (athlete?.displayName) {
    return athlete.displayName
  }

  const user = athlete?.authUser ?? athlete

  return [
    user?.firstName,
    user?.lastName,
  ]
    .filter(Boolean)
    .join(' ')
}

const getResultStatus = (result) =>
  String(
    result?.statusCode ??
      result?.status ??
      '',
  ).toUpperCase()

const isApprovedResult = (result) => {
  const status = getResultStatus(result)

  return (
    status === 'APPROVED' ||
    status === 'ACCEPTED'
  )
}

export default function CreateResultPage() {
  const navigate = useNavigate()

  const currentUser = useMemo(() => {
    const stored =
      sessionStorage.getItem(
        'currentUser',
      )

    if (!stored) {
      return null
    }

    try {
      return JSON.parse(stored)
    } catch {
      return null
    }
  }, [])

  const isAthlete =
    Number(currentUser?.accessLevel) === 3

  /*
   * Contexte
   */
  const [teamId, setTeamId] =
    useState('')

  const [testId, setTestId] =
    useState('')

  const [testDate, setTestDate] =
    useState(getToday())

  /*
   * Athlète connecté
   */
  const [
    currentAthlete,
    setCurrentAthlete,
  ] = useState(null)

  const [
    isLoadingCurrentAthlete,
    setIsLoadingCurrentAthlete,
  ] = useState(false)

  const [
    currentAthleteError,
    setCurrentAthleteError,
  ] = useState('')

  /*
   * Équipes
   */
  const [teams, setTeams] =
    useState([])

  const [
    isLoadingTeams,
    setIsLoadingTeams,
  ] = useState(false)

  const [
    teamsError,
    setTeamsError,
  ] = useState('')

  /*
   * PhysicalTests complets.
   */
  const [
    physicalTests,
    setPhysicalTests,
  ] = useState([])

  const [
    isLoadingPhysicalTests,
    setIsLoadingPhysicalTests,
  ] = useState(false)

  const [
    physicalTestsError,
    setPhysicalTestsError,
  ] = useState('')

  /*
   * Results assignés de l'équipe.
   */
  const [
    teamResults,
    setTeamResults,
  ] = useState([])

  const [
    isLoadingResults,
    setIsLoadingResults,
  ] = useState(false)

  const [
    resultsError,
    setResultsError,
  ] = useState('')

  /*
   * Sélection
   */
  const [
    selectionMode,
    setSelectionMode,
  ] = useState(
    SELECTION_MODE.MULTIPLE,
  )

  const [
    selectedResultIds,
    setSelectedResultIds,
  ] = useState([])

  const [search, setSearch] =
    useState('')

  const [error, setError] =
    useState('')

  /*
   * Charger l'athlète connecté.
   */
  useEffect(() => {
    if (!isAthlete) {
      return
    }

    let isMounted = true

    const loadCurrentAthlete =
      async () => {
        setIsLoadingCurrentAthlete(
          true,
        )

        setCurrentAthleteError('')

        const result =
          await athleteService
            .getCurrentAthlete()

        if (!isMounted) {
          return
        }

        if (!result.success) {
          setCurrentAthlete(null)

          setCurrentAthleteError(
            result.error ??
              'Impossible de charger votre profil athlète.',
          )

          setIsLoadingCurrentAthlete(
            false,
          )

          return
        }

        setCurrentAthlete(
          result.data,
        )

        const athleteTeams =
          Array.isArray(
            result.data?.teams,
          )
            ? result.data.teams
            : []

        if (athleteTeams.length > 0) {
          setTeamId(
            String(
              athleteTeams[0].id,
            ),
          )
        } else {
          setCurrentAthleteError(
            'Aucune équipe n’est associée à votre compte.',
          )
        }

        setSelectionMode(
          SELECTION_MODE.ONE,
        )

        setIsLoadingCurrentAthlete(
          false,
        )
      }

    loadCurrentAthlete()

    return () => {
      isMounted = false
    }
  }, [isAthlete])

  /*
   * Charger les équipes.
   *
   * Cette liste est surtout utilisée
   * pour Admin / Coach / Kiné.
   */
  useEffect(() => {
    let isMounted = true

    const loadTeams = async () => {
      setIsLoadingTeams(true)
      setTeamsError('')

      const result =
        await teamService
          .getDisplayTeams()

      if (!isMounted) {
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

      setIsLoadingTeams(false)
    }

    loadTeams()

    return () => {
      isMounted = false
    }
  }, [])

  /*
   * Charger les PhysicalTests.
   */
  useEffect(() => {
    let isMounted = true

    const loadPhysicalTests =
      async () => {
        setIsLoadingPhysicalTests(
          true,
        )

        setPhysicalTestsError('')

        const result =
          await physicalTestService
            .getAll()

        if (!isMounted) {
          return
        }

        if (result.success) {
          setPhysicalTests(
            Array.isArray(
              result.data,
            )
              ? result.data
              : [],
          )
        } else {
          setPhysicalTests([])

          setPhysicalTestsError(
            result.error ??
              'Impossible de charger les détails des tests.',
          )
        }

        setIsLoadingPhysicalTests(
          false,
        )
      }

    loadPhysicalTests()

    return () => {
      isMounted = false
    }
  }, [])

  /*
   * Charger les Results de l'équipe.
   */
  useEffect(() => {
    let isMounted = true

    const loadTeamResults =
      async () => {
        if (!teamId) {
          setTeamResults([])
          setTestId('')
          setSelectedResultIds([])
          setResultsError('')
          setSearch('')

          return
        }

        setIsLoadingResults(true)
        setResultsError('')

        setTeamResults([])
        setTestId('')
        setSelectedResultIds([])
        setSearch('')

        const result =
          await resultService
            .getTeamResults(
              teamId,
            )

        if (!isMounted) {
          return
        }

        if (result.success) {
          setTeamResults(
            Array.isArray(
              result.data,
            )
              ? result.data
              : [],
          )
        } else {
          setTeamResults([])

          setResultsError(
            result.error ??
              'Impossible de charger les résultats de cette équipe.',
          )
        }

        setIsLoadingResults(false)
      }

    loadTeamResults()

    return () => {
      isMounted = false
    }
  }, [teamId])

  /*
   * ID de l'athlète connecté.
   */
  const currentAthleteId =
    currentAthlete?.authUser?.id ??
    currentAthlete?.id ??
    currentUser?.id

  /*
   * Results disponibles pour l'athlète.
   *
   * On ne garde que :
   * - ses propres résultats
   * - les résultats non approuvés
   */
  const athleteResults =
    useMemo(() => {
      if (
        !isAthlete ||
        !currentAthleteId
      ) {
        return []
      }

      return teamResults.filter(
        (result) => {
          const resultAthleteId =
            result?.athlete?.id ??
            result?.athlete
              ?.authUser?.id

          const isCurrentAthlete =
            String(
              resultAthleteId ?? '',
            ) ===
            String(
              currentAthleteId,
            )

          return (
            isCurrentAthlete &&
            !isApprovedResult(
              result,
            )
          )
        },
      )
    }, [
      isAthlete,
      teamResults,
      currentAthleteId,
    ])

  /*
   * Tests disponibles.
   *
   * Pour un athlète :
   * uniquement les tests reliés à ses
   * propres résultats disponibles.
   *
   * Pour les autres rôles :
   * tous les tests assignés à l'équipe.
   */
  const tests = useMemo(() => {
    const sourceResults =
      isAthlete
        ? athleteResults
        : teamResults

    const assignedTestIds =
      new Set(
        sourceResults
          .map(
            (result) =>
              result?.test?.id,
          )
          .filter(
            (id) =>
              id !== null &&
              id !== undefined,
          )
          .map(String),
      )

    return physicalTests.filter(
      (test) =>
        assignedTestIds.has(
          String(test.id),
        ),
    )
  }, [
    teamResults,
    athleteResults,
    physicalTests,
    isAthlete,
  ])

  /*
   * Results correspondant au test choisi.
   *
   * On exclut les résultats approuvés
   * et on garde un résultat par athlète.
   */
  const testResults = useMemo(() => {
    if (!testId) {
      return []
    }

    const sourceResults =
      isAthlete
        ? athleteResults
        : teamResults

    const matchingResults =
      sourceResults.filter(
        (result) => {
          const sameTest =
            String(
              result?.test?.id ?? '',
            ) === String(testId)

          return (
            sameTest &&
            !isApprovedResult(
              result,
            )
          )
        },
      )

    const latestResultByAthlete =
      new Map()

    matchingResults.forEach(
      (result) => {
        const athleteId =
          result?.athlete?.id ??
          result?.athlete
            ?.authUser?.id

        if (
          athleteId === null ||
          athleteId === undefined
        ) {
          return
        }

        const key =
          String(athleteId)

        const current =
          latestResultByAthlete.get(
            key,
          )

        if (
          !current ||
          Number(result.id) >
            Number(current.id)
        ) {
          latestResultByAthlete.set(
            key,
            result,
          )
        }
      },
    )

    return Array.from(
      latestResultByAthlete.values(),
    )
  }, [
    teamResults,
    athleteResults,
    testId,
    isAthlete,
  ])

  /*
   * Pour un athlète, sélectionner
   * automatiquement son Result
   * lorsqu'il choisit un test.
   */
  useEffect(() => {
    if (
      !isAthlete ||
      !testId
    ) {
      return
    }

    if (testResults.length === 0) {
      setSelectedResultIds([])
      return
    }

    setSelectedResultIds([
      String(testResults[0].id),
    ])
  }, [
    isAthlete,
    testId,
    testResults,
  ])

  /*
   * Recherche des athlètes.
   */
  const filteredResults =
    useMemo(() => {
      const normalizedSearch =
        search
          .trim()
          .toLowerCase()

      if (!normalizedSearch) {
        return testResults
      }

      return testResults.filter(
        (result) => {
          const athlete =
            result?.athlete

          const name =
            getAthleteName(
              athlete,
            ).toLowerCase()

          const username =
            String(
              athlete?.username ??
                athlete?.authUser
                  ?.username ??
                '',
            ).toLowerCase()

          return (
            name.includes(
              normalizedSearch,
            ) ||
            username.includes(
              normalizedSearch,
            )
          )
        },
      )
    }, [
      testResults,
      search,
    ])

  /*
   * Results sélectionnés.
   */
  const selectedResults =
    useMemo(
      () =>
        testResults.filter(
          (result) =>
            selectedResultIds.includes(
              String(result.id),
            ),
        ),
      [
        testResults,
        selectedResultIds,
      ],
    )

  const selectedAthletes =
    useMemo(
      () =>
        selectedResults
          .map(
            (result) =>
              result?.athlete,
          )
          .filter(Boolean),
      [selectedResults],
    )

  /*
   * Équipe de l'athlète connecté.
   */
  const currentAthleteTeam =
    useMemo(() => {
      if (!isAthlete) {
        return null
      }

      const athleteTeams =
        Array.isArray(
          currentAthlete?.teams,
        )
          ? currentAthlete.teams
          : []

      return (
        athleteTeams.find(
          (team) =>
            String(team.id) ===
            String(teamId),
        ) ??
        athleteTeams[0] ??
        null
      )
    }, [
      isAthlete,
      currentAthlete,
      teamId,
    ])

  const currentAthleteName =
    useMemo(() => {
      if (!currentAthlete) {
        return ''
      }

      return getAthleteName(
        currentAthlete,
      )
    }, [currentAthlete])

  const handleTeamChange = (
    event,
  ) => {
    setTeamId(
      event.target.value,
    )

    setTestId('')
    setSelectedResultIds([])
    setSearch('')
    setError('')
  }

  const handleTestChange = (
    event,
  ) => {
    setTestId(
      event.target.value,
    )

    setSelectedResultIds([])
    setSearch('')
    setError('')
  }

  const handleModeChange = (
    mode,
  ) => {
    setSelectionMode(mode)
    setSelectedResultIds([])
    setError('')

    if (
      mode ===
      SELECTION_MODE.ALL
    ) {
      setSelectedResultIds(
        testResults.map(
          (result) =>
            String(result.id),
        ),
      )
    }
  }

  const toggleResult = (
    resultId,
  ) => {
    const normalizedId =
      String(resultId)

    if (
      selectionMode ===
      SELECTION_MODE.ONE
    ) {
      setSelectedResultIds([
        normalizedId,
      ])

      return
    }

    setSelectedResultIds(
      (currentIds) => {
        if (
          currentIds.includes(
            normalizedId,
          )
        ) {
          return currentIds.filter(
            (id) =>
              id !== normalizedId,
          )
        }

        return [
          ...currentIds,
          normalizedId,
        ]
      },
    )
  }

  const removeResult = (
    resultId,
  ) => {
    setSelectedResultIds(
      (currentIds) =>
        currentIds.filter(
          (id) =>
            id !==
            String(resultId),
        ),
    )
  }

  const handleCancel = () => {
    navigate('/resultats')
  }

  const handleContinue = () => {
    setError('')

    if (!teamId) {
      setError(
        'Veuillez sélectionner une équipe.',
      )

      return
    }

    if (!testId) {
      setError(
        'Veuillez sélectionner un test.',
      )

      return
    }

    if (!testDate) {
      setError(
        'Veuillez sélectionner une date de saisie.',
      )

      return
    }

    if (
      selectedResultIds.length ===
      0
    ) {
      setError(
        isAthlete
          ? 'Aucun résultat disponible pour ce test.'
          : 'Veuillez sélectionner au moins un athlète.',
      )

      return
    }

    const selectedTest =
      tests.find(
        (test) =>
          String(test.id) ===
          String(testId),
      )

    if (!selectedTest) {
      setError(
        'Impossible de récupérer les détails du test sélectionné.',
      )

      return
    }

    const selectedTeam =
      isAthlete
        ? currentAthleteTeam
        : teams.find(
            (team) =>
              String(team.id) ===
              String(teamId),
          )

    const context = {
      test: selectedTest,
      team: selectedTeam,
      testDate,
      athletes: selectedAthletes,
      results: selectedResults,
    }

    /*
     * Un athlète saisit toujours
     * uniquement son propre résultat.
     */
    if (
      isAthlete ||
      selectionMode ===
        SELECTION_MODE.ONE
    ) {
      navigate(
        '/resultats/creer/single',
        {
          state: context,
        },
      )

      return
    }

    navigate(
      '/resultats/creer/multiple',
      {
        state: context,
      },
    )
  }

  const isLoadingContext =
    isLoadingResults ||
    isLoadingPhysicalTests ||
    isLoadingCurrentAthlete

  /*
   * PAGE ATHLÈTE
   */
  if (isAthlete) {
    return (
      <div className="create-result-page">
        <button
          type="button"
          className="create-result-page__back"
          onClick={() =>
            navigate('/resultats')
          }
        >
          <span aria-hidden="true">
            ←
          </span>

          Retour aux tests
        </button>

        <div className="create-result-page__heading">
          <h1>
            Saisir un résultat
          </h1>

          <div className="create-result-step-badge">
            <span className="create-result-step-badge__dot" />

            Étape 1 • Sélection du contexte
          </div>
        </div>

        <section className="create-result-card">
          <h2>1. Sélection</h2>

          <div className="create-result-access-info">
            <div className="create-result-access-info__title">
              <span
                className="create-result-access-info__info-icon"
                aria-hidden="true"
              >
                i
              </span>

              <span>
                En tant qu&apos;athlète,
                vous avez accès uniquement
                aux tests disponibles pour
                votre équipe. Vous pouvez
                saisir uniquement votre
                propre résultat.
              </span>
            </div>
          </div>

          {currentAthleteError && (
            <div className="create-result-error">
              {currentAthleteError}
            </div>
          )}

          {error && (
            <div className="create-result-error">
              {error}
            </div>
          )}

          <div className="create-result-context-grid">
            {/* Test */}
            <div className="create-result-field">
              <label htmlFor="result-test">
                Test

                <span className="required-marker">
                  {' '}*
                </span>
              </label>

              <select
                id="result-test"
                value={testId}
                onChange={
                  handleTestChange
                }
                disabled={
                  !teamId ||
                  isLoadingContext ||
                  Boolean(
                    resultsError,
                  )
                }
              >
                <option value="">
                  {isLoadingContext
                    ? 'Chargement des tests...'
                    : 'Sélectionner un test'}
                </option>

                {tests.map(
                  (test) => (
                    <option
                      key={
                        test.id
                      }
                      value={
                        test.id
                      }
                    >
                      {
                        test.name
                      }
                    </option>
                  ),
                )}
              </select>

              {resultsError && (
                <p className="create-result-field__error">
                  {resultsError}
                </p>
              )}

              {physicalTestsError && (
                <p className="create-result-field__error">
                  {physicalTestsError}
                </p>
              )}

              {teamId &&
                !isLoadingContext &&
                !resultsError &&
                !physicalTestsError &&
                tests.length === 0 && (
                  <p className="create-result-field__error">
                    Aucun test disponible
                    pour votre compte.
                  </p>
                )}

              <p className="create-result-field__help">
                La liste contient
                uniquement les tests
                disponibles pour vous.
              </p>
            </div>

            {/* Date */}
            <div className="create-result-field">
              <label htmlFor="result-date">
                Date de saisie des résultats

                <span className="required-marker">
                  {' '}*
                </span>
              </label>

              <input
                id="result-date"
                type="date"
                value={testDate}
                onChange={(event) =>
                  setTestDate(
                    event.target.value,
                  )
                }
              />

              <p className="create-result-field__help">
                La date du jour est
                affichée par défaut.
              </p>
            </div>

            {/* Équipe */}
            <div className="create-result-field">
              <label htmlFor="result-team">
                Équipe

                <span className="required-marker">
                  {' '}*
                </span>
              </label>

              <input
                id="result-team"
                type="text"
                value={
                  isLoadingCurrentAthlete
                    ? 'Chargement...'
                    : currentAthleteTeam
                        ?.name ?? ''
                }
                disabled
              />

              <p className="create-result-field__help">
                Votre équipe est renseignée
                automatiquement et ne peut
                pas être modifiée.
              </p>
            </div>
          </div>

          <div className="create-result-divider" />

          <div className="create-result-athletes">
            <h2>
              2. Athlète concerné
            </h2>

            <p className="create-result-athletes__description">
              Le résultat est saisi pour
              votre propre compte.
            </p>

            <div className="create-result-mode-grid">
              <button
                type="button"
                className="create-result-mode create-result-mode--selected"
                disabled
              >
                <span
                  className="create-result-mode__radio"
                  aria-hidden="true"
                />

                <span
                  className="create-result-mode__icon"
                  aria-hidden="true"
                >
                  ♙
                </span>

                <span>
                  Un athlète
                </span>
              </button>
            </div>

            <div className="create-result-athlete-grid create-result-athlete-grid--single">
              <div className="create-result-field">
                <label htmlFor="current-athlete">
                  Athlète

                  <span className="required-marker">
                    {' '}*
                  </span>
                </label>

                <input
                  id="current-athlete"
                  type="text"
                  value={
                    isLoadingCurrentAthlete
                      ? 'Chargement...'
                      : currentAthleteName
                  }
                  disabled
                />

                <p className="create-result-field__help">
                  Votre nom est renseigné
                  automatiquement à partir
                  de votre compte connecté
                  et ne peut pas être
                  modifié.
                </p>
              </div>
            </div>
          </div>

          <div className="create-result-actions">
            <button
              type="button"
              className="create-result-button create-result-button--secondary"
              onClick={
                handleCancel
              }
            >
              Annuler
            </button>

            <button
              type="button"
              className="create-result-button create-result-button--primary"
              onClick={
                handleContinue
              }
              disabled={
                isLoadingContext ||
                !testId ||
                selectedResultIds.length === 0
              }
            >
              Continuer
            </button>
          </div>
        </section>
      </div>
    )
  }

  /*
   * PAGE ADMIN / COACH / KINÉ
   */
  return (
    <div className="create-result-page">
      <div className="create-result-page__topbar">
        <div className="create-result-step-badge">
          <span className="create-result-step-badge__dot" />

          Étape 1 • Sélection du contexte
        </div>

        <button
          type="button"
          className="create-result-page__back"
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

      <section className="create-result-card">
        <h2>1. Sélection</h2>

        {error && (
          <div className="create-result-error">
            {error}
          </div>
        )}

        <div className="create-result-access-info">
          <div className="create-result-access-info__title">
            <span
              className="create-result-access-info__info-icon"
              aria-hidden="true"
            >
              i
            </span>

            <span>
              Les accès aux tests et
              aux équipes dépendent de
              votre rôle :
            </span>
          </div>

          <div className="create-result-access-info__roles">
            <div className="create-result-role">
              <div
                className="create-result-role__icon"
                aria-hidden="true"
              >
                ♔
              </div>

              <p>
                <strong>
                  Administrateur :
                </strong>{' '}
                accès aux équipes et
                aux tests assignés à
                leurs athlètes.
              </p>
            </div>

            <div className="create-result-role">
              <div
                className="create-result-role__icon"
                aria-hidden="true"
              >
                ◎
              </div>

              <p>
                <strong>
                  Coach :
                </strong>{' '}
                accès aux résultats
                assignés aux athlètes
                de son équipe.
              </p>
            </div>

            <div className="create-result-role">
              <div
                className="create-result-role__icon"
                aria-hidden="true"
              >
                +
              </div>

              <p>
                <strong>
                  Kiné :
                </strong>{' '}
                accès aux résultats
                assignés aux athlètes
                de ses équipes.
              </p>
            </div>
          </div>
        </div>

        <div className="create-result-context-grid">
          {/* Équipe */}
          <div className="create-result-field">
            <label htmlFor="result-team">
              Équipe

              <span className="required-marker">
                {' '}*
              </span>
            </label>

            <select
              id="result-team"
              value={teamId}
              onChange={
                handleTeamChange
              }
              disabled={
                isLoadingTeams
              }
            >
              <option value="">
                {isLoadingTeams
                  ? 'Chargement des équipes...'
                  : 'Sélectionner une équipe'}
              </option>

              {teams.map(
                (team) => (
                  <option
                    key={
                      team.id
                    }
                    value={
                      team.id
                    }
                  >
                    {
                      team.name
                    }
                  </option>
                ),
              )}
            </select>

            {teamsError && (
              <p className="create-result-field__error">
                {teamsError}
              </p>
            )}

            <p className="create-result-field__help">
              Sélectionnez d&apos;abord
              l&apos;équipe concernée.
            </p>
          </div>

          {/* Test */}
          <div className="create-result-field">
            <label htmlFor="result-test">
              Test

              <span className="required-marker">
                {' '}*
              </span>
            </label>

            <select
              id="result-test"
              value={testId}
              onChange={
                handleTestChange
              }
              disabled={
                !teamId ||
                isLoadingContext ||
                Boolean(
                  resultsError,
                )
              }
            >
              <option value="">
                {!teamId
                  ? 'Sélectionner une équipe d’abord'
                  : isLoadingContext
                    ? 'Chargement des tests...'
                    : 'Sélectionner un test'}
              </option>

              {tests.map(
                (test) => (
                  <option
                    key={
                      test.id
                    }
                    value={
                      test.id
                    }
                  >
                    {
                      test.name
                    }
                  </option>
                ),
              )}
            </select>

            {resultsError && (
              <p className="create-result-field__error">
                {resultsError}
              </p>
            )}

            {physicalTestsError && (
              <p className="create-result-field__error">
                {physicalTestsError}
              </p>
            )}

            {teamId &&
              !isLoadingContext &&
              !resultsError &&
              !physicalTestsError &&
              tests.length === 0 && (
                <p className="create-result-field__error">
                  Aucun test assigné aux
                  athlètes de cette équipe.
                </p>
              )}

            <p className="create-result-field__help">
              La liste contient les
              tests ayant déjà été
              assignés aux athlètes de
              l&apos;équipe.
            </p>
          </div>

          {/* Date */}
          <div className="create-result-field">
            <label htmlFor="result-date">
              Date de saisie des
              résultats

              <span className="required-marker">
                {' '}*
              </span>
            </label>

            <input
              id="result-date"
              type="date"
              value={testDate}
              onChange={(event) =>
                setTestDate(
                  event.target.value,
                )
              }
            />

            <p className="create-result-field__help">
              La date du jour est
              affichée par défaut.
            </p>
          </div>
        </div>

        <div className="create-result-divider" />

        <div className="create-result-athletes">
          <h2>
            2. Athlètes concernés
          </h2>

          <p className="create-result-athletes__description">
            Choisissez si le résultat
            est saisi pour un athlète,
            plusieurs athlètes ou tous
            les athlètes ayant ce test
            assigné.
          </p>

          <div className="create-result-mode-grid">
            <button
              type="button"
              className={`create-result-mode ${
                selectionMode ===
                SELECTION_MODE.ONE
                  ? 'create-result-mode--selected'
                  : ''
              }`}
              onClick={() =>
                handleModeChange(
                  SELECTION_MODE.ONE,
                )
              }
              disabled={
                !testId ||
                isLoadingContext
              }
            >
              <span
                className="create-result-mode__radio"
                aria-hidden="true"
              />

              <span
                className="create-result-mode__icon"
                aria-hidden="true"
              >
                ♙
              </span>

              <span>
                Un athlète
              </span>
            </button>

            <button
              type="button"
              className={`create-result-mode ${
                selectionMode ===
                SELECTION_MODE.MULTIPLE
                  ? 'create-result-mode--selected'
                  : ''
              }`}
              onClick={() =>
                handleModeChange(
                  SELECTION_MODE.MULTIPLE,
                )
              }
              disabled={
                !testId ||
                isLoadingContext
              }
            >
              <span
                className="create-result-mode__radio"
                aria-hidden="true"
              />

              <span
                className="create-result-mode__icon"
                aria-hidden="true"
              >
                ♙♙
              </span>

              <span>
                Plusieurs athlètes
              </span>
            </button>

            <button
              type="button"
              className={`create-result-mode ${
                selectionMode ===
                SELECTION_MODE.ALL
                  ? 'create-result-mode--selected'
                  : ''
              }`}
              onClick={() =>
                handleModeChange(
                  SELECTION_MODE.ALL,
                )
              }
              disabled={
                !testId ||
                isLoadingContext ||
                testResults.length ===
                  0
              }
            >
              <span
                className="create-result-mode__radio"
                aria-hidden="true"
              />

              <span
                className="create-result-mode__icon"
                aria-hidden="true"
              >
                ♙♙♙
              </span>

              <span>
                Tous les athlètes
              </span>
            </button>
          </div>

          <div className="create-result-athlete-grid">
            <div>
              <div className="create-result-athlete-list">
                <div className="create-result-athlete-search">
                  <span aria-hidden="true">
                    ⌕
                  </span>

                  <input
                    type="text"
                    value={search}
                    placeholder="Rechercher un athlète"
                    onChange={(
                      event,
                    ) =>
                      setSearch(
                        event.target
                          .value,
                      )
                    }
                    disabled={
                      !testId ||
                      isLoadingContext
                    }
                  />
                </div>

                {!teamId && (
                  <div className="create-result-athlete-empty">
                    Sélectionnez
                    d&apos;abord une
                    équipe.
                  </div>
                )}

                {teamId &&
                  !testId &&
                  !isLoadingContext && (
                    <div className="create-result-athlete-empty">
                      Sélectionnez
                      ensuite un test.
                    </div>
                  )}

                {isLoadingContext && (
                  <div className="create-result-athlete-empty">
                    Chargement des
                    résultats...
                  </div>
                )}

                {testId &&
                  !isLoadingContext &&
                  filteredResults
                    .length ===
                    0 && (
                    <div className="create-result-athlete-empty">
                      Aucun athlète
                      trouvé pour ce
                      test.
                    </div>
                  )}

                {testId &&
                  !isLoadingContext &&
                  filteredResults.map(
                    (result) => {
                      const resultId =
                        String(
                          result.id,
                        )

                      const checked =
                        selectedResultIds.includes(
                          resultId,
                        )

                      const athlete =
                        result?.athlete

                      return (
                        <label
                          key={
                            result.id
                          }
                          className="create-result-athlete-row"
                        >
                          <input
                            type={
                              selectionMode ===
                              SELECTION_MODE.ONE
                                ? 'radio'
                                : 'checkbox'
                            }
                            name={
                              selectionMode ===
                              SELECTION_MODE.ONE
                                ? 'selectedResult'
                                : undefined
                            }
                            checked={
                              checked
                            }
                            onChange={() =>
                              toggleResult(
                                result.id,
                              )
                            }
                            disabled={
                              selectionMode ===
                              SELECTION_MODE.ALL
                            }
                          />

                          <span>
                            {getAthleteName(
                              athlete,
                            )}
                          </span>
                        </label>
                      )
                    },
                  )}
              </div>

              <p className="create-result-athlete-help">
                Seuls les athlètes ayant
                le test sélectionné
                assigné sont affichés.
              </p>
            </div>

            <div className="create-result-selected-card">
              <strong>
                {
                  selectedResults.length
                }{' '}
                {selectedResults.length >
                1
                  ? 'athlètes sélectionnés'
                  : 'athlète sélectionné'}
              </strong>

              <div className="create-result-selected-tags">
                {selectedResults.map(
                  (result) => {
                    const athlete =
                      result?.athlete

                    return (
                      <div
                        key={
                          result.id
                        }
                        className="create-result-selected-tag"
                      >
                        <span>
                          {getAthleteName(
                            athlete,
                          )}
                        </span>

                        {selectionMode !==
                          SELECTION_MODE.ALL && (
                          <button
                            type="button"
                            aria-label={`Retirer ${getAthleteName(
                              athlete,
                            )}`}
                            onClick={() =>
                              removeResult(
                                result.id,
                              )
                            }
                          >
                            ×
                          </button>
                        )}
                      </div>
                    )
                  },
                )}

                {selectedResults.length ===
                  0 && (
                  <span className="create-result-selected-empty">
                    Aucun athlète
                    sélectionné.
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="create-result-actions">
          <button
            type="button"
            className="create-result-button create-result-button--secondary"
            onClick={
              handleCancel
            }
          >
            Annuler
          </button>

          <button
            type="button"
            className="create-result-button create-result-button--primary"
            onClick={
              handleContinue
            }
            disabled={
              isLoadingTeams ||
              isLoadingContext
            }
          >
            Continuer
          </button>
        </div>
      </section>
    </div>
  )
}
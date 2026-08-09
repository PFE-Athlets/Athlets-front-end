import {
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useNavigate } from 'react-router-dom'

import { teamService } from '../../api/teamService'
import { athleteService } from '../../api/athleteService'

import '../../styles/create-result.css'

const MOCK_TESTS = [
  {
    id: 1,
    name: 'Développé couché',
  },
  {
    id: 2,
    name: 'Sprint 30 m',
  },
  {
    id: 3,
    name: 'Saut vertical',
  },
]

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

  return [
    athlete?.firstName,
    athlete?.lastName,
  ]
    .filter(Boolean)
    .join(' ')
}

export default function CreateResultPage() {
  const navigate = useNavigate()

  /*
   * Tests
   *
   * Pour l'instant, les tests restent mockés.
   * On pourra les remplacer par le vrai service
   * lorsque l'endpoint sera branché.
   */
  const tests = MOCK_TESTS

  /*
   * Contexte
   */
  const [testId, setTestId] =
    useState('')

  const [teamId, setTeamId] =
    useState('')

  const [testDate, setTestDate] =
    useState(getToday())

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
   * Athlètes
   */
  const [athletes, setAthletes] =
    useState([])

  const [
    isLoadingAthletes,
    setIsLoadingAthletes,
  ] = useState(false)

  const [
    athletesError,
    setAthletesError,
  ] = useState('')

  /*
   * Sélection des athlètes
   */
  const [
    selectionMode,
    setSelectionMode,
  ] = useState(
    SELECTION_MODE.MULTIPLE,
  )

  const [
    selectedAthleteIds,
    setSelectedAthleteIds,
  ] = useState([])

  const [search, setSearch] =
    useState('')

  /*
   * Erreur générale
   */
  const [error, setError] =
    useState('')

  /*
   * Charger les équipes au chargement
   * de la page.
   */
  useEffect(() => {
    let isMounted = true

    const loadTeams = async () => {
      setIsLoadingTeams(true)
      setTeamsError('')

      const result =
        await teamService.getDisplayTeams()

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
   * Charger les athlètes lorsqu'une
   * équipe est sélectionnée.
   */
  useEffect(() => {
    let isMounted = true

    const loadAthletes = async () => {
      /*
       * Aucun team sélectionné :
       * on vide simplement les athlètes.
       */
      if (!teamId) {
        setAthletes([])
        setSelectedAthleteIds([])
        setAthletesError('')
        setSearch('')
        return
      }

      setIsLoadingAthletes(true)
      setAthletesError('')

      /*
       * On vide l'ancienne sélection
       * pendant qu'on change d'équipe.
       */
      setAthletes([])
      setSelectedAthleteIds([])
      setSearch('')

      const result =
        await athleteService
          .getDisplayAthletesByTeam(
            teamId,
          )

      if (!isMounted) {
        return
      }

      if (result.success) {
        const loadedAthletes =
          Array.isArray(result.data)
            ? result.data
            : []

        setAthletes(
          loadedAthletes,
        )

        /*
         * Si le mode "Tous" était déjà
         * actif, on sélectionne automatiquement
         * les athlètes de la nouvelle équipe.
         */
        if (
          selectionMode ===
          SELECTION_MODE.ALL
        ) {
          setSelectedAthleteIds(
            loadedAthletes.map(
              (athlete) =>
                String(
                  athlete.id,
                ),
            ),
          )
        }
      } else {
        setAthletes([])

        setAthletesError(
          result.error ??
            'Impossible de charger les athlètes de cette équipe.',
        )
      }

      setIsLoadingAthletes(false)
    }

    loadAthletes()

    return () => {
      isMounted = false
    }
  }, [teamId, selectionMode])

  /*
   * Recherche d'athlètes
   */
  const filteredAthletes =
    useMemo(() => {
      const normalizedSearch =
        search
          .trim()
          .toLowerCase()

      if (!normalizedSearch) {
        return athletes
      }

      return athletes.filter(
        (athlete) => {
          const name =
            getAthleteName(
              athlete,
            ).toLowerCase()

          const username =
            String(
              athlete.username ?? '',
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
    }, [athletes, search])

  /*
   * Objets complets correspondant aux
   * athlètes sélectionnés.
   */
  const selectedAthletes =
    useMemo(
      () =>
        athletes.filter(
          (athlete) =>
            selectedAthleteIds.includes(
              String(
                athlete.id,
              ),
            ),
        ),
      [
        athletes,
        selectedAthleteIds,
      ],
    )

  const handleTeamChange = (
    event,
  ) => {
    setTeamId(
      event.target.value,
    )

    setSelectedAthleteIds([])
    setSearch('')
    setError('')
  }

  const handleModeChange = (
    mode,
  ) => {
    setSelectionMode(mode)
    setSelectedAthleteIds([])
    setError('')

    /*
     * Tous les athlètes
     */
    if (
      mode ===
      SELECTION_MODE.ALL
    ) {
      setSelectedAthleteIds(
        athletes.map(
          (athlete) =>
            String(
              athlete.id,
            ),
        ),
      )
    }
  }

  const toggleAthlete = (
    athleteId,
  ) => {
    const normalizedId =
      String(athleteId)

    /*
     * Un seul athlète
     */
    if (
      selectionMode ===
      SELECTION_MODE.ONE
    ) {
      setSelectedAthleteIds([
        normalizedId,
      ])

      return
    }

    /*
     * Plusieurs athlètes
     */
    setSelectedAthleteIds(
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

  const removeAthlete = (
    athleteId,
  ) => {
    setSelectedAthleteIds(
      (currentIds) =>
        currentIds.filter(
          (id) =>
            id !==
            String(athleteId),
        ),
    )
  }

  const handleCancel = () => {
    navigate('/resultats')
  }

  const handleContinue = () => {
    setError('')

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

    if (!teamId) {
      setError(
        'Veuillez sélectionner une équipe.',
      )

      return
    }

    if (
      selectedAthleteIds.length ===
      0
    ) {
      setError(
        'Veuillez sélectionner au moins un athlète.',
      )

      return
    }

    const selectedTest =
      tests.find(
        (test) =>
          String(test.id) ===
          String(testId),
      )

    const selectedTeam =
      teams.find(
        (team) =>
          String(team.id) ===
          String(teamId),
      )

    const context = {
    test: selectedTest,
    team: selectedTeam,
    testDate,
    athletes: selectedAthletes,
  }

  if (selectionMode === SELECTION_MODE.ONE) {
    navigate('/resultats/creer/single', {
      state: context,
    })

    return
  }

  navigate('/resultats/creer/multiple', {
    state: context,
  })
  }

  return (
    <div className="create-result-page">
      {/* Top bar */}
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

      {/* Carte principale */}
      <section className="create-result-card">
        <h2>1. Sélection</h2>

        {/* Erreur générale */}
        {error && (
          <div className="create-result-error">
            {error}
          </div>
        )}

        {/* Information rôles */}
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
                accès à tous les tests
                qui se trouvent dans des
                batteries de tests actives,
                et à toutes les équipes.
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
                accès aux tests des
                batteries de tests actives
                associées à son équipe.
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
                accès aux tests des
                batteries de tests actives
                associées à ses équipes.
              </p>
            </div>
          </div>
        </div>

        {/* Contexte */}
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
              onChange={(event) =>
                setTestId(
                  event.target.value,
                )
              }
            >
              <option value="">
                Sélectionner un test
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

            <p className="create-result-field__help">
              La liste contient
              uniquement les tests
              présents dans des
              batteries de tests
              actives.
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
              Pour
              l’administrateur :
              choix parmi toutes les
              équipes.
              <br />

              Pour le coach :
              équipe associée
              automatiquement.
              <br />

              Pour le kiné :
              choix parmi ses équipes
              associées.
            </p>
          </div>
        </div>

        <div className="create-result-divider" />

        {/* Athlètes */}
        <div className="create-result-athletes">
          <h2>
            2. Athlètes concernés
          </h2>

          <p className="create-result-athletes__description">
            Choisissez si le résultat
            est saisi pour un athlète,
            pour plusieurs athlètes ou
            pour tous les athlètes de
            l&apos;équipe sélectionnée.
          </p>

          {/* Modes de sélection */}
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
                !teamId ||
                isLoadingAthletes
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
                !teamId ||
                isLoadingAthletes
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
                !teamId ||
                isLoadingAthletes ||
                athletes.length ===
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
            {/* Liste */}
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
                      !teamId ||
                      isLoadingAthletes
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
                  isLoadingAthletes && (
                    <div className="create-result-athlete-empty">
                      Chargement des
                      athlètes...
                    </div>
                  )}

                {teamId &&
                  !isLoadingAthletes &&
                  athletesError && (
                    <div className="create-result-athlete-empty">
                      {
                        athletesError
                      }
                    </div>
                  )}

                {teamId &&
                  !isLoadingAthletes &&
                  !athletesError &&
                  filteredAthletes
                    .length ===
                    0 && (
                    <div className="create-result-athlete-empty">
                      Aucun athlète
                      trouvé.
                    </div>
                  )}

                {teamId &&
                  !isLoadingAthletes &&
                  !athletesError &&
                  filteredAthletes.map(
                    (athlete) => {
                      const athleteId =
                        String(
                          athlete.id,
                        )

                      const checked =
                        selectedAthleteIds.includes(
                          athleteId,
                        )

                      return (
                        <label
                          key={
                            athlete.id
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
                                ? 'selectedAthlete'
                                : undefined
                            }
                            checked={
                              checked
                            }
                            onChange={() =>
                              toggleAthlete(
                                athlete.id,
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
                Les athlètes affichés
                appartiennent à
                l&apos;équipe
                sélectionnée.
              </p>
            </div>

            {/* Athlètes sélectionnés */}
            <div className="create-result-selected-card">
              <strong>
                {
                  selectedAthletes.length
                }{' '}
                {selectedAthletes.length >
                1
                  ? 'athlètes sélectionnés'
                  : 'athlète sélectionné'}
              </strong>

              <div className="create-result-selected-tags">
                {selectedAthletes.map(
                  (athlete) => (
                    <div
                      key={
                        athlete.id
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
                            removeAthlete(
                              athlete.id,
                            )
                          }
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ),
                )}

                {selectedAthletes.length ===
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

        {/* Actions */}
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
              isLoadingAthletes
            }
          >
            Continuer
          </button>
        </div>
      </section>
    </div>
  )
}
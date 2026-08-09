import {
  useMemo,
  useState,
} from 'react'
import {
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom'

import { TrashIcon } from '../../components/Icons.jsx'
import { resultService } from '../../api/resultService'

import '../../styles/create-result-single-athlete.css'

const getAthleteName = (athlete) => {
  if (!athlete) {
    return '—'
  }

  if (athlete.fullName) {
    return athlete.fullName
  }

  if (athlete.displayName) {
    return athlete.displayName
  }

  const user =
    athlete.authUser ?? athlete

  return [
    user?.firstName,
    user?.lastName,
  ]
    .filter(Boolean)
    .join(' ') || '—'
}

const formatDate = (
  value,
  longFormat = false,
) => {
  if (!value) {
    return '—'
  }

  const date = new Date(
    `${value}T00:00:00`,
  )

  if (
    Number.isNaN(date.getTime())
  ) {
    return value
  }

  if (longFormat) {
    return new Intl.DateTimeFormat(
      'fr-CA',
      {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      },
    ).format(date)
  }

  return new Intl.DateTimeFormat(
    'fr-CA',
    {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    },
  ).format(date)
}

const getResultTypeId = (
  resultValue,
) =>
  resultValue?.resultType?.id ??
  resultValue?.resultTypeId ??
  null

const getResultValue = (
  resultValue,
) =>
  resultValue?.value ?? ''

const getUnitForType = (
  resultType,
) =>
  resultType?.unitSymbol ??
  resultType?.unitName ??
  resultType?.unit ??
  '—'

export default function CreateResultSingleAthletePage() {
  const navigate = useNavigate()
  const location = useLocation()

  const currentUser = useMemo(() => {
    const storedUser =
      sessionStorage.getItem(
        'currentUser',
      )

    if (!storedUser) {
      return null
    }

    try {
      return JSON.parse(
        storedUser,
      )
    } catch {
      return null
    }
  }, [])

  const isAthlete =
    Number(
      currentUser?.accessLevel,
    ) === 3

  const context =
    location.state ?? null

  const test =
    context?.test ?? null

  const team =
    context?.team ?? null

  const testDate =
    context?.testDate ?? ''

  /*
   * Le Result sélectionné
   * à l'étape 1.
   */
  const assignedResult =
    context?.results?.[0] ??
    context?.result ??
    null

  const athlete =
    assignedResult?.athlete ??
    context?.athletes?.[0] ??
    context?.athlete ??
    null

  /*
   * Les ResultType viennent directement
   * du PhysicalTest réel sélectionné.
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
   * Préremplissage des valeurs déjà
   * enregistrées dans le Result.
   *
   * Une entrée est créée pour chaque
   * ResultType défini dans le PhysicalTest.
   */
  const initialResults =
    useMemo(
      () =>
        resultTypes.map(
          (resultType) => {
            const existingValue =
              assignedResult
                ?.resultValues
                ?.find(
                  (value) =>
                    String(
                      getResultTypeId(
                        value,
                      ),
                    ) ===
                    String(
                      resultType.id,
                    ),
                )

            return {
              resultTypeId:
                resultType.id,

              value:
                getResultValue(
                  existingValue,
                ),
            }
          },
        ),
      [
        resultTypes,
        assignedResult,
      ],
    )

  const [
    results,
    setResults,
  ] = useState(
    initialResults,
  )

  const [
    proofLink,
    setProofLink,
  ] = useState(
    assignedResult?.proof ?? '',
  )

  const [
    comment,
    setComment,
  ] = useState(
    assignedResult?.comment ??
      assignedResult?.commentText ??
      '',
  )

  const [
    showProofHelp,
    setShowProofHelp,
  ] = useState(false)

  const [
    error,
    setError,
  ] = useState('')

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false)

  const testName =
    test?.name ??
    test?.testName ??
    '—'

  const teamName =
    team?.name ?? '—'

  const athleteName =
    getAthleteName(
      athlete,
    )

  const athleteNumber =
    athlete?.number ??
    athlete?.athleteNumber ??
    athlete?.jerseyNumber ??
    null

  const protocol =
    test?.protocol ??
    ''

  if (
    !context ||
    !test ||
    !team ||
    !assignedResult ||
    !athlete
  ) {
    return (
      <Navigate
        to="/resultats/creer"
        replace
      />
    )
  }

  const updateResult = (
    resultTypeId,
    value,
  ) => {
    setResults(
      (
        currentResults,
      ) =>
        currentResults.map(
          (result) =>
            String(
              result.resultTypeId,
            ) ===
            String(
              resultTypeId,
            )
              ? {
                  ...result,
                  value,
                }
              : result,
        ),
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

    if (
      results.length === 0
    ) {
      return 'Aucune valeur de résultat à enregistrer.'
    }

    const hasMissingValue =
      results.some(
        (result) =>
          result.value === '' ||
          result.value === null ||
          result.value === undefined,
      )

    if (hasMissingValue) {
      return 'Veuillez saisir une valeur pour chaque résultat.'
    }

    const hasInvalidValue =
      results.some(
        (result) =>
          !Number.isFinite(
            Number(
              result.value,
            ),
          ),
      )

    if (hasInvalidValue) {
      return 'Les valeurs des résultats doivent être numériques.'
    }

    if (
      comment.length > 500
    ) {
      return 'Le commentaire ne peut pas dépasser 500 caractères.'
    }

    if (
      proofLink.trim() &&
      !/^https?:\/\/.+/i.test(
        proofLink.trim(),
      )
    ) {
      return 'Le lien de preuve doit être une URL valide commençant par http:// ou https://.'
    }

    if (
      test?.proofRequired &&
      !proofLink.trim()
    ) {
      return 'Une preuve est requise pour ce test.'
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
      id:
        assignedResult.id,

      testDate,

      proof:
        proofLink.trim() ||
        null,

      comment:
        comment.trim() ||
        null,

      resultValues:
        results.map(
          (result) => ({
            resultTypeId:
              Number(
                result.resultTypeId,
              ),

            value:
              Number(
                result.value,
              ),
          }),
        ),
    }

    try {
      const response =
        await resultService.submit(
          payload,
        )

      if (
        !response.success
      ) {
        setError(
          response.error ??
            'Impossible d’enregistrer le résultat.',
        )

        return
      }

      navigate(
        '/resultats',
      )
    } finally {
      setIsSubmitting(
        false,
      )
    }
  }

  /*
   * =====================================
   * UI ATHLÈTE
   * =====================================
   */
  if (isAthlete) {
    return (
      <div className="create-single-result-page create-single-result-page--athlete">
        <button
          type="button"
          className="create-single-result-page__back"
          onClick={
            handleBack
          }
        >
          <span aria-hidden="true">
            ←
          </span>

          Retour à la sélection
        </button>

        <div className="create-single-result-page__heading">
          <h1>
            Saisir un résultat
          </h1>
        </div>

        <div className="create-single-result-steps">
          <div className="create-single-result-step create-single-result-step--completed">
            <span className="create-single-result-step__number">
              ✓
            </span>

            <span>
              Étape 1 – Sélection du contexte
            </span>
          </div>

          <div className="create-single-result-step__line" />

          <div className="create-single-result-step create-single-result-step--active">
            <span className="create-single-result-step__number">
              2
            </span>

            <span>
              Étape 2 – Saisie du résultat
            </span>
          </div>
        </div>

        {error && (
          <div className="create-result-error">
            {error}
          </div>
        )}

        {/* Contexte */}
        <section className="create-single-result-context">
          <h2>
            Contexte sélectionné
          </h2>

          <div className="create-single-result-summary">
            <div className="create-single-result-summary__item">
              <div
                className="create-single-result-summary__icon"
                aria-hidden="true"
              >
                ◷
              </div>

              <div>
                <span className="create-single-result-summary__label">
                  Test
                </span>

                <strong>
                  {
                    testName
                  }
                </strong>
              </div>
            </div>

            <div className="create-single-result-summary__item">
              <div
                className="create-single-result-summary__icon"
                aria-hidden="true"
              >
                □
              </div>

              <div>
                <span className="create-single-result-summary__label">
                  Date de saisie
                </span>

                <strong>
                  {formatDate(
                    testDate,
                    true,
                  )}
                </strong>
              </div>
            </div>

            <div className="create-single-result-summary__item">
              <div
                className="create-single-result-summary__icon"
                aria-hidden="true"
              >
                ♙♙
              </div>

              <div>
                <span className="create-single-result-summary__label">
                  Équipe
                </span>

                <strong>
                  {
                    teamName
                  }
                </strong>
              </div>
            </div>

            <div className="create-single-result-summary__item">
              <div
                className="create-single-result-summary__icon"
                aria-hidden="true"
              >
                ♙
              </div>

              <div className="create-single-result-summary__athlete">
                <div>
                  <span className="create-single-result-summary__label">
                    Athlète
                  </span>

                  <strong>
                    {
                      athleteName
                    }

                    {athleteNumber && (
                      <>
                        {' '}
                        (#
                        {
                          athleteNumber
                        }
                        )
                      </>
                    )}
                  </strong>
                </div>

                <span className="create-single-result-you-badge">
                  Vous
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Statut automatique */}
        <div className="create-single-result-pending-info">
          <span
            className="create-single-result-pending-info__icon"
            aria-hidden="true"
          >
            i
          </span>

          <span>
            Le statut de votre résultat sera automatiquement défini à
          </span>

          <strong>
            En attente d’approbation.
          </strong>
        </div>

        {/* Protocole */}
        {protocol && (
          <section className="create-single-result-protocol">
            <div className="create-single-result-protocol__header">
              <span
                className="create-single-result-protocol__icon"
                aria-hidden="true"
              >
                ▣
              </span>

              <h2>
                Protocole du test
              </h2>
            </div>

            <div className="create-single-result-protocol__content">
              {
                protocol
              }
            </div>
          </section>
        )}

        {/* Saisie */}
        <section className="create-single-result-entry">
          <div className="create-single-result-entry__header">
            <h2>
              Saisir les résultats
            </h2>

            <p>
              Entrez vos valeurs pour chacun des types de résultats requis.
            </p>
          </div>

          {/*
           * IMPORTANT :
           * les lignes sont générées
           * dynamiquement depuis
           * test.resultTypes.
           */}
          <div className="create-single-result-values">
            <div className="create-single-result-values__header">
              <span>
                Type de résultat
              </span>

              <span>
                Valeur
              </span>

              <span>
                Unité
              </span>
            </div>

            {resultTypes.map(
              (
                resultType,
              ) => {
                const result =
                  results.find(
                    (
                      item,
                    ) =>
                      String(
                        item.resultTypeId,
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
                    className="create-single-result-values__row"
                  >
                    <div>
                      {
                        resultType.name
                      }
                    </div>

                    <input
                      type="number"
                      step="any"
                      value={
                        result?.value ??
                        ''
                      }
                      placeholder="Saisir une valeur"
                      onChange={(
                        event,
                      ) =>
                        updateResult(
                          resultType.id,
                          event.target
                            .value,
                        )
                      }
                    />

                    <div className="create-single-result-unit">
                      {getUnitForType(
                        resultType,
                      )}
                    </div>
                  </div>
                )
              },
            )}
          </div>

          <div className="create-single-result-values__footer">
            <p>
              Les types de résultats et leurs unités sont définis automatiquement par le test physique.
            </p>
          </div>

          {/* Preuve */}
          <div className="create-single-result-form-extra">
            <div className="create-single-result-proof-section">
              <div className="create-single-result-proof-section__title">
                <strong>
                  {test?.proofRequired
                    ? 'Preuve requise'
                    : 'Preuve'}
                </strong>

                <div className="create-single-result-proof-help">
                  <button
                    type="button"
                    className="create-single-result-proof-info"
                    aria-label="Afficher les instructions pour ajouter une preuve"
                    aria-expanded={
                      showProofHelp
                    }
                    onClick={() =>
                      setShowProofHelp(
                        (
                          current,
                        ) =>
                          !current,
                      )
                    }
                  >
                    i
                  </button>

                  {showProofHelp && (
                    <div
                      className="create-single-result-proof-popover"
                      role="dialog"
                      aria-label="Instructions pour ajouter une preuve"
                    >
                      <ul>
                        <li>
                          Prendre une photo ou une vidéo du test réalisé.
                        </li>

                        <li>
                          Enregistrer la photo ou la vidéo dans OneDrive.
                        </li>

                        <li>
                          Dans OneDrive, repérer le fichier à partager.
                        </li>

                        <li>
                          Cliquer sur les trois petits points à droite du nom du fichier.
                        </li>

                        <li>
                          Sélectionner l&apos;option Partager.
                        </li>

                        <li>
                          À côté du bouton Copier le lien, cliquer sur l&apos;icône d&apos;engrenage pour ouvrir les paramètres du lien.
                        </li>

                        <li>
                          Sélectionner l&apos;option Toute personne ayant le lien peut consulter.
                        </li>

                        <li>
                          Cliquer sur Appliquer.
                        </li>

                        <li>
                          Cliquer sur Copier le lien.
                        </li>

                        <li>
                          Coller le lien dans le champ prévu à cet effet dans AthlETS.
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <p>
                {test?.proofRequired
                  ? 'Ce test nécessite une preuve vidéo ou photo.'
                  : 'Vous pouvez ajouter une preuve vidéo ou photo si nécessaire.'}
              </p>

              <label htmlFor="result-proof-athlete">
                Lien de la preuve (URL)

                {test?.proofRequired && (
                  <span className="required-marker">
                    {' '}*
                  </span>
                )}
              </label>

              <div className="create-single-result-proof">
                <span aria-hidden="true">
                  🔗
                </span>

                <input
                  id="result-proof-athlete"
                  type="url"
                  value={
                    proofLink
                  }
                  placeholder="Coller le lien de la preuve"
                  onChange={(
                    event,
                  ) =>
                    setProofLink(
                      event.target
                        .value,
                    )
                  }
                />
              </div>

              <p className="create-single-result-help">
                Entrez un lien public ou partageable menant à votre vidéo ou photo.
              </p>
            </div>

            {/* Commentaire */}
            <div className="create-single-result-comment-field">
              <label htmlFor="result-comment-athlete">
                Commentaire (optionnel)
              </label>

              <div className="create-single-result-comment">
                <textarea
                  id="result-comment-athlete"
                  value={
                    comment
                  }
                  maxLength={
                    500
                  }
                  placeholder="Ajouter un commentaire (optionnel)..."
                  onChange={(
                    event,
                  ) =>
                    setComment(
                      event.target
                        .value,
                    )
                  }
                />

                <span>
                  {
                    comment.length
                  }
                  /500
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Actions Athlète */}
        <div className="create-single-result-actions">
          <button
            type="button"
            className="create-result-button create-result-button--secondary"
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
            className="create-result-button create-result-button--primary create-single-result-submit"
            onClick={
              handleSubmit
            }
            disabled={
              isSubmitting
            }
          >
            {isSubmitting
              ? 'Enregistrement...'
              : 'Enregistrer le résultat'}
          </button>
        </div>
      </div>
    )
  }

  /*
   * =====================================
   * UI ADMIN / COACH / KINÉ
   * =====================================
   *
   * Ton ancien UI reste inchangé.
   */
  return (
    <div className="create-single-result-page">
      {/* Barre du haut */}
      <div className="create-single-result-page__topbar">
        <div className="create-single-result-steps">
          <div className="create-single-result-step">
            <span className="create-single-result-step__number">
              1
            </span>

            <span>
              Sélection
            </span>
          </div>

          <div className="create-single-result-step__line" />

          <div className="create-single-result-step create-single-result-step--active">
            <span className="create-single-result-step__number">
              2
            </span>

            <span>
              Résultat – 1 athlète
            </span>
          </div>
        </div>

        <button
          type="button"
          className="create-single-result-page__back"
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

      <section className="create-single-result-card">
        {error && (
          <div className="create-result-error">
            {error}
          </div>
        )}

        {/* 1. Rappel */}
        <div className="create-single-result-section">
          <h2>
            1. Rappel de la sélection
          </h2>

          <div className="create-single-result-summary">
            <div className="create-single-result-summary__item">
              <div className="create-single-result-summary__icon">
                ◷
              </div>

              <div>
                <span className="create-single-result-summary__label">
                  Test
                </span>

                <strong>
                  {
                    testName
                  }
                </strong>
              </div>
            </div>

            <div className="create-single-result-summary__item">
              <div className="create-single-result-summary__icon">
                □
              </div>

              <div>
                <span className="create-single-result-summary__label">
                  Date de saisie des résultats
                </span>

                <strong>
                  {formatDate(
                    testDate,
                  )}
                </strong>
              </div>
            </div>

            <div className="create-single-result-summary__item">
              <div className="create-single-result-summary__icon">
                ♙♙
              </div>

              <div>
                <span className="create-single-result-summary__label">
                  Équipe
                </span>

                <strong>
                  {
                    teamName
                  }
                </strong>
              </div>
            </div>

            <div className="create-single-result-summary__item">
              <div className="create-single-result-summary__icon">
                ♙
              </div>

              <div>
                <span className="create-single-result-summary__label">
                  Athlète
                </span>

                <strong>
                  {
                    athleteName
                  }
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Valeurs */}
        <div className="create-single-result-section">
          <h2>
            2. Valeurs du résultat
          </h2>

          <p className="create-single-result-section__description">
            Saisissez les valeurs attendues pour le test sélectionné.
          </p>

          <div className="create-single-result-values">
            <div className="create-single-result-values__header">
              <span>
                Type de résultat
              </span>

              <span>
                Valeur
              </span>

              <span>
                Unité
              </span>

              <span />
            </div>

            {resultTypes.map(
              (
                resultType,
              ) => {
                const result =
                  results.find(
                    (
                      item,
                    ) =>
                      String(
                        item.resultTypeId,
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
                    className="create-single-result-values__row"
                  >
                    <div>
                      {
                        resultType.name
                      }
                    </div>

                    <input
                      type="number"
                      step="any"
                      value={
                        result?.value ??
                        ''
                      }
                      placeholder="Saisir une valeur"
                      onChange={(
                        event,
                      ) =>
                        updateResult(
                          resultType.id,
                          event.target
                            .value,
                        )
                      }
                    />

                    <div className="create-single-result-unit">
                      {getUnitForType(
                        resultType,
                      )}
                    </div>

                    <div className="create-single-result-delete-container">
                      <TrashIcon />
                    </div>
                  </div>
                )
              },
            )}
          </div>

          <div className="create-single-result-values__footer">
            <p>
              Les types de résultats et leurs unités sont définis automatiquement par le test physique.
            </p>
          </div>
        </div>

        {/* 3. Informations */}
        <div className="create-single-result-section create-single-result-section--last">
          <h2>
            3. Informations complémentaires
          </h2>

          <div className="create-single-result-extra-grid">
            <div className="create-single-result-extra-field">
              <label>
                Statut
              </label>

              <div className="create-single-result-status">
                <span className="create-single-result-status__icon">
                  ✓
                </span>

                <strong>
                  Approuvé
                </strong>
              </div>
            </div>

            <div className="create-single-result-extra-field">
              <label htmlFor="result-proof">
                Lien de preuve

                {test?.proofRequired && (
                  <span className="required-marker">
                    {' '}*
                  </span>
                )}
              </label>

              <div className="create-single-result-proof">
                <span aria-hidden="true">
                  🔗
                </span>

                <input
                  id="result-proof"
                  type="url"
                  value={
                    proofLink
                  }
                  placeholder="Coller le lien de la preuve"
                  onChange={(
                    event,
                  ) =>
                    setProofLink(
                      event.target
                        .value,
                    )
                  }
                />
              </div>

              <p>
                {test?.proofRequired
                  ? 'Une preuve est requise pour ce test.'
                  : 'Ajoutez un lien web vers une preuve du résultat si nécessaire.'}
              </p>
            </div>

            <div className="create-single-result-extra-field">
              <label htmlFor="result-comment">
                Commentaire
              </label>

              <div className="create-single-result-comment">
                <textarea
                  id="result-comment"
                  value={
                    comment
                  }
                  maxLength={
                    500
                  }
                  placeholder="Ajouter un commentaire (optionnel)..."
                  onChange={(
                    event,
                  ) =>
                    setComment(
                      event.target
                        .value,
                    )
                  }
                />

                <span>
                  {
                    comment.length
                  }
                  /500
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="create-single-result-actions">
          <button
            type="button"
            className="create-result-button create-result-button--secondary"
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
            className="create-result-button create-result-button--primary create-single-result-submit"
            onClick={
              handleSubmit
            }
            disabled={
              isSubmitting
            }
          >
            {isSubmitting
              ? 'Enregistrement...'
              : 'Enregistrer le résultat'}
          </button>
        </div>
      </section>
    </div>
  )
}
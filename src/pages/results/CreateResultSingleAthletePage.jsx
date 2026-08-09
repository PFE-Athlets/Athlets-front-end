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
import '../../styles/create-result-single-athlete.css'

const RESULT_TYPES = [
  {
    value: 'TIME',
    label: 'Temps',
    unit: 's',
  },
  {
    value: 'POWER',
    label: 'Puissance',
    unit: 'W/kg',
  },
  {
    value: 'WEIGHT',
    label: 'Poids',
    unit: 'kg',
  },
  {
    value: 'DISTANCE',
    label: 'Distance',
    unit: 'm',
  },
  {
    value: 'REPETITIONS',
    label: 'Répétitions',
    unit: 'reps',
  },
]

const createEmptyResult = () => ({
  id: crypto.randomUUID(),
  type: '',
  value: '',
})

const getAthleteName = (athlete) => {
  if (!athlete) {
    return '—'
  }

  if (athlete.fullName) {
    return athlete.fullName
  }

  return [
    athlete.firstName,
    athlete.lastName,
  ]
    .filter(Boolean)
    .join(' ') || '—'
}

const formatDate = (value) => {
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

  return new Intl.DateTimeFormat(
    'fr-CA',
    {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    },
  ).format(date)
}

export default function CreateResultSingleAthletePage() {
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

  const athlete =
    context?.athletes?.[0] ??
    context?.athlete ??
    null

  const [results, setResults] =
    useState([
      createEmptyResult(),
    ])

  const [proofLink, setProofLink] =
    useState('')

  const [comment, setComment] =
    useState('')

  const [error, setError] =
    useState('')

  const [isSubmitting, setIsSubmitting] =
    useState(false)

  const testName =
    test?.name ??
    test?.testName ??
    '—'

  const teamName =
    team?.name ?? '—'

  const athleteName =
    getAthleteName(athlete)

  const canAddResult =
    results.length <
    RESULT_TYPES.length

  const usedResultTypes =
    useMemo(
      () =>
        results
          .map(
            (result) =>
              result.type,
          )
          .filter(Boolean),
      [results],
    )

  if (
    !context ||
    !test ||
    !team ||
    !athlete
  ) {
    return (
      <Navigate
        to="/resultats/creer"
        replace
      />
    )
  }

  const getUnitForType = (
    type,
  ) =>
    RESULT_TYPES.find(
      (option) =>
        option.value === type,
    )?.unit ?? '—'

  const updateResult = (
    resultId,
    field,
    value,
  ) => {
    setResults(
      (currentResults) =>
        currentResults.map(
          (result) =>
            result.id === resultId
              ? {
                  ...result,
                  [field]: value,
                }
              : result,
        ),
    )

    setError('')
  }

  const handleAddResult = () => {
    if (!canAddResult) {
      return
    }

    setResults(
      (currentResults) => [
        ...currentResults,
        createEmptyResult(),
      ],
    )
  }

  const handleRemoveResult = (
    resultId,
  ) => {
    if (results.length === 1) {
      setResults([
        createEmptyResult(),
      ])

      return
    }

    setResults(
      (currentResults) =>
        currentResults.filter(
          (result) =>
            result.id !==
            resultId,
        ),
    )
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
      results.length === 0
    ) {
      return 'Ajoutez au moins une valeur de résultat.'
    }

    const hasMissingType =
      results.some(
        (result) =>
          !result.type,
      )

    if (hasMissingType) {
      return 'Veuillez sélectionner un type pour chaque résultat.'
    }

    const hasMissingValue =
      results.some(
        (result) =>
          result.value === '',
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

    const uniqueTypes =
      new Set(
        results.map(
          (result) =>
            result.type,
        ),
      )

    if (
      uniqueTypes.size !==
      results.length
    ) {
      return 'Un même type de résultat ne peut pas être ajouté plusieurs fois.'
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
      athleteId: athlete.id,
      username:
        athlete.username,
      resultDate:
        testDate,

      values: results.map(
        (result) => ({
          type:
            result.type,
          value: Number(
            result.value,
          ),
          unit:
            getUnitForType(
              result.type,
            ),
        }),
      ),

      proofLink:
        proofLink.trim() ||
        null,

      comment:
        comment.trim() ||
        null,
    }

    try {
      /*
       * À remplacer par le vrai appel API :
       *
       * const response =
       *   await resultService.create(payload)
       *
       * if (!response.success) {
       *   setError(response.error)
       *   return
       * }
       */

      console.log(
        'Résultat à enregistrer :',
        payload,
      )

      /*
       * Quand l'API sera branchée :
       *
       * navigate('/resultats')
       */
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="create-single-result-page">
        {/* Barre du haut */}
        <div className="create-single-result-page__topbar">
            <div className="create-single-result-steps">
                <div className="create-single-result-step">
                <span className="create-single-result-step__number">
                    1
                </span>

                <span>Sélection</span>
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
                onClick={() => navigate('/resultats')}
            >
                <span aria-hidden="true">←</span>
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
                  {testName}
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
                  {teamName}
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
                  {athleteName}
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
            Saisissez une ou plusieurs
            valeurs selon le test
            sélectionné.
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

              <span>
                Action
              </span>
            </div>

            {results.map(
              (result) => (
                <div
                  key={
                    result.id
                  }
                  className="create-single-result-values__row"
                >
                  <select
                    value={
                      result.type
                    }
                    onChange={(
                      event,
                    ) =>
                      updateResult(
                        result.id,
                        'type',
                        event
                          .target
                          .value,
                      )
                    }
                  >
                    <option value="">
                      Sélectionner
                    </option>

                    {RESULT_TYPES.map(
                      (option) => {
                        const alreadyUsed =
                          usedResultTypes.includes(
                            option.value,
                          )

                        const disabled =
                          alreadyUsed &&
                          option.value !==
                            result.type

                        return (
                          <option
                            key={
                              option.value
                            }
                            value={
                              option.value
                            }
                            disabled={
                              disabled
                            }
                          >
                            {
                              option.label
                            }
                          </option>
                        )
                      },
                    )}
                  </select>

                  <input
                    type="number"
                    step="any"
                    value={
                      result.value
                    }
                    placeholder="Saisir une valeur"
                    onChange={(
                      event,
                    ) =>
                      updateResult(
                        result.id,
                        'value',
                        event
                          .target
                          .value,
                      )
                    }
                  />

                  <div className="create-single-result-unit">
                    {getUnitForType(
                      result.type,
                    )}
                  </div>

                  <div className="create-single-result-delete-container">
                    <button
                        type="button"
                        className="create-single-result-delete"
                        aria-label="Supprimer cette valeur"
                        onClick={() =>
                            handleRemoveResult(result.id)
                        }
                        >
                        <TrashIcon />
                    </button>
                  </div>
                </div>
              ),
            )}
          </div>

          <div className="create-single-result-values__footer">
            <p>
              L&apos;unité est affichée
              automatiquement selon le
              type de résultat
              sélectionné.
            </p>

            {canAddResult && (
              <button
                type="button"
                className="create-single-result-add-value"
                onClick={
                  handleAddResult
                }
              >
                + Ajouter une valeur
              </button>
            )}
          </div>
        </div>

        {/* 3. Informations */}
        <div className="create-single-result-section create-single-result-section--last">
          <h2>
            3. Informations complémentaires
          </h2>

          <div className="create-single-result-extra-grid">
            {/* Statut */}
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

            {/* Preuve */}
            <div className="create-single-result-extra-field">
              <label htmlFor="result-proof">
                Lien de preuve
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
                      event
                        .target
                        .value,
                    )
                  }
                />
              </div>

              <p>
                Ajoutez un lien web
                (URL) vers une preuve
                du résultat.
              </p>
            </div>

            {/* Commentaire */}
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
                  maxLength={500}
                  placeholder="Ajouter un commentaire (optionnel)..."
                  onChange={(
                    event,
                  ) =>
                    setComment(
                      event
                        .target
                        .value,
                    )
                  }
                />

                <span>
                  {comment.length}
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
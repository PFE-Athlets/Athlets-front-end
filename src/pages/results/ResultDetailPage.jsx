import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { resultService } from '../../api/resultService'

import {
  UserIcon,
  CalendarDateIcon,
  TrophyIcon,
  TeamIcon,
  TargetIcon,
  ShieldIcon,
} from '../../components/Icons'

import '../../styles/result-details.css'

const STATUS_CONFIG = {
  PENDING: {
    label: 'En attente d’approbation',
    className: 'result-details-status--pending',
  },
  ASSIGNED: {
    label: 'Assigné',
    className: 'result-details-status--assigned',
  },
  APPROVED: {
    label: 'Approuvé',
    className: 'result-details-status--approved',
  },
  REJECTED: {
    label: 'Refusé',
    className: 'result-details-status--rejected',
  },
  CANCELLED: {
    label: 'Annulé',
    className: 'result-details-status--cancelled',
  },
}

const formatDate = (value) => {
  if (!value) {
    return 'Non spécifié'
  }

  const date = new Date(
    value.includes?.('T')
      ? value
      : `${value}T00:00:00`,
  )

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('fr-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

const getFormattedNumericValue = (formattedValue) => {
  if (!formattedValue) {
    return '—'
  }

  const separatorIndex = formattedValue.indexOf(':')

  if (separatorIndex === -1) {
    return formattedValue
  }

  return formattedValue
    .slice(separatorIndex + 1)
    .trim()
}

const getValueWithoutUnit = (
  formattedValue,
  unitSymbol,
) => {
  const valueWithUnit =
    getFormattedNumericValue(formattedValue)

  if (!unitSymbol || valueWithUnit === '—') {
    return valueWithUnit
  }

  return valueWithUnit
    .replace(
      new RegExp(`\\s*${unitSymbol}$`),
      '',
    )
    .trim()
}

export default function ResultDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const currentUser = useMemo(() => {
    const storedUser =
      sessionStorage.getItem('currentUser')

    if (!storedUser) {
      return null
    }

    try {
      return JSON.parse(storedUser)
    } catch {
      return null
    }
  }, [])

  const isAthlete =
    Number(currentUser?.accessLevel) === 3

  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [verifying, setVerifying] =
    useState(false)

  const [verifyError, setVerifyError] =
    useState('')

  useEffect(() => {
    const fetchResult = async () => {
      setLoading(true)
      setError('')

      const response =
        await resultService.getResultById(id)

      if (!response.success) {
        console.error(
          'Erreur lors du chargement du résultat :',
          response.error,
        )

        setError(
          response.error ||
            'Une erreur est survenue lors du chargement du résultat.',
        )

        setLoading(false)
        return
      }

      setResult(response.data)
      setLoading(false)
    }

    fetchResult()
  }, [id])

  const resultValues = useMemo(
    () =>
      Array.isArray(result?.resultValues)
        ? result.resultValues
        : [],
    [result],
  )

  const mainResult =
    resultValues[0] ?? null

  const statusKey =
    result?.statusCode
      ?.toString()
      .trim()
      .toUpperCase() ?? ''

  const statusConfig =
    STATUS_CONFIG[statusKey] ?? {
      label:
        result?.statusLabel ||
        result?.statusCode ||
        'Non spécifié',
      className:
        'result-details-status--assigned',
    }

  const canEnterResult =
    isAthlete &&
    statusKey === 'ASSIGNED'

  const canVerifyResult =
    !isAthlete &&
    statusKey === 'PENDING'

  const handleEnterResult = () => {
    if (!result) {
      return
    }

    navigate('/resultats/creer/single', {
      state: {
        test: result.test,
        team: result.team,
        testDate:
          result.testDate ??
          new Date()
            .toISOString()
            .slice(0, 10),
        athlete: result.athlete,
        result,
        fromResultDetails: true,
      },
    })
  }

  const handleVerifyResult = async (
    approved,
  ) => {
    if (!result || verifying) {
      return
    }

    setVerifying(true)
    setVerifyError('')

    const response =
      await resultService.verifyResult(
        result.id,
        approved,
      )

    if (!response.success) {
      setVerifyError(
        response.error ||
          'Impossible de modifier le statut du résultat.',
      )

      setVerifying(false)
      return
    }

    setResult((currentResult) => ({
      ...currentResult,
      statusCode: approved
        ? 'APPROVED'
        : 'REJECTED',
      statusLabel: approved
        ? 'Accepted'
        : 'Rejected',
    }))

    setVerifying(false)
  }

  if (loading) {
    return (
      <section className="result-details-page">
        <div className="result-details-card">
          Chargement du résultat...
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="result-details-page">
        <div className="result-details-card">
          <div className="result-details-error">
            {error}
          </div>

          <div className="result-details-actions">
            <button
              type="button"
              className="result-details-btn result-details-btn--secondary"
              onClick={() =>
                navigate('/resultats')
              }
            >
              Retour
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="result-details-page">
      <div className="result-details-card">

        {/* Informations principales */}
        <section className="result-details-section">
          <div className="result-details-section__heading">
            <h2>
              Informations du résultat
            </h2>

            <span
              className={`result-details-status ${statusConfig.className}`}
            >
              {statusConfig.label}
            </span>
          </div>

          <div className="result-details-grid result-details-grid--two">
            <InfoItem
              icon={<UserIcon />}
              label="Athlète"
              value={
                result?.athlete?.displayName ||
                'Non spécifié'
              }
            />

            <InfoItem
              icon={<TrophyIcon />}
              label="Test physique"
              value={
                result?.test?.name ||
                'Non spécifié'
              }
            />

            <InfoItem
              icon={<TeamIcon />}
              label="Équipe"
              value={
                result?.team?.name ||
                'Non spécifié'
              }
            />

            <InfoItem
              icon={<CalendarDateIcon />}
              label="Date de réalisation"
              value={formatDate(
                result?.testDate,
              )}
            />
          </div>
        </section>

        {/* Résultats */}
        <section className="result-details-section">
          <h2>
            Résultats
          </h2>

          {mainResult && (
            <div className="result-details-main-value">
              <div className="result-details-main-value__icon">
                <TargetIcon />
              </div>

              <div>
                <p className="result-details-main-value__label">
                  Valeur principale
                </p>

                <div className="result-details-main-value__value">
                  {getValueWithoutUnit(
                    mainResult.formattedValue,
                    mainResult.unitSymbol,
                  )}

                  {mainResult.unitSymbol && (
                    <span>
                      {mainResult.unitSymbol}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {resultValues.length > 0 ? (
            <div className="result-details-values">
              <div className="result-details-values__header">
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

              {resultValues.map(
                (resultValue) => (
                  <div
                    key={resultValue.resultTypeId}
                    className="result-details-values__row"
                  >
                    <strong>
                      {
                        resultValue.resultTypeName
                      }
                    </strong>

                    <span>
                      {getValueWithoutUnit(
                        resultValue.formattedValue,
                        resultValue.unitSymbol,
                      )}
                    </span>

                    <span className="result-details-values__unit">
                      {resultValue.unitSymbol ||
                        '—'}
                    </span>
                  </div>
                ),
              )}
            </div>
          ) : (
            <div className="result-details-empty">
              {statusKey === 'ASSIGNED'
                ? 'Ce résultat n’a pas encore été complété.'
                : 'Aucune valeur enregistrée.'}
            </div>
          )}
        </section>

        {/* Informations complémentaires */}
        <section className="result-details-section">
          <h2>
            Informations complémentaires
          </h2>

          <div className="result-details-grid result-details-grid--two">
            <InfoItem
              icon={<UserIcon />}
              label="Résultat saisi par"
              value={
                result?.intervenant
                  ?.displayName ||
                'Non spécifié'
              }
            />

            <InfoItem
              icon={<ShieldIcon />}
              label="Statut"
              value={
                <span
                  className={`result-details-status ${statusConfig.className}`}
                >
                  {statusConfig.label}
                </span>
              }
            />
          </div>
        </section>

        {/* Commentaire */}
        <section className="result-details-section">
          <h2>
            Commentaire
          </h2>

          <div className="result-details-notes">
            {result?.commentText?.trim()
              ? result.commentText
              : 'Aucun commentaire.'}
          </div>
        </section>

        {/* Preuve */}
        {result?.proof && (
          <section className="result-details-section">
            <h2>
              Preuve
            </h2>

            <div className="result-details-proof">
              <a
                href={result.proof}
                target="_blank"
                rel="noopener noreferrer"
              >
                Ouvrir la preuve
              </a>
            </div>
          </section>
        )}

        {verifyError && (
          <div className="result-details-error">
            {verifyError}
          </div>
        )}

        {/* Actions */}
        <div className="result-details-actions">
          <button
            type="button"
            className="result-details-btn result-details-btn--secondary"
            onClick={() => navigate(-1)}
            disabled={verifying}
          >
            Retour
          </button>

          {canEnterResult && (
            <button
              type="button"
              className="result-details-btn result-details-btn--primary"
              onClick={handleEnterResult}
            >
              Saisir le résultat
            </button>
          )}

          {canVerifyResult && (
            <>
              <button
                type="button"
                className="result-details-btn result-details-btn--reject"
                onClick={() =>
                  handleVerifyResult(false)
                }
                disabled={verifying}
              >
                Refuser
              </button>

              <button
                type="button"
                className="result-details-btn result-details-btn--approve"
                onClick={() =>
                  handleVerifyResult(true)
                }
                disabled={verifying}
              >
                {verifying
                  ? 'Traitement...'
                  : 'Approuver'}
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

function InfoItem({
  icon,
  label,
  value,
}) {
  return (
    <article className="result-details-info">
      <div className="result-details-info__icon">
        {icon}
      </div>

      <div>
        <p className="result-details-info__label">
          {label}
        </p>

        <div className="result-details-info__value">
          {value || 'Non spécifié'}
        </div>
      </div>
    </article>
  )
}
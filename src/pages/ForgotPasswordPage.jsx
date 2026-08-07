import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/login.css'
import '../styles/link-modal.css'
import { authService } from '../api/authService'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [resetLink, setResetLink] = useState('')
  const [copySuccess, setCopySuccess] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()

    setError('')
    setCopySuccess(false)

    const normalizedEmail = email.trim()

    if (!normalizedEmail) {
      setError(
        'Veuillez saisir votre adresse courriel.',
      )
      return
    }

    setLoading(true)

    try {
      const result =
        await authService.requestPasswordReset({
          email: normalizedEmail,
        })

      if (!result.success) {
        setError(
          result.error ??
            'Impossible d’envoyer la demande de réinitialisation.',
        )
        return
      }

      if (!result.data) {
        setError(
          'Le lien de réinitialisation n’a pas été retourné.',
        )
        return
      }

      setResetLink(result.data)
    } catch (requestError) {
      console.error(
        'Erreur de demande de réinitialisation :',
        requestError,
      )

      setError(
        'Une erreur inattendue s’est produite.',
      )
    } finally {
      setLoading(false)
    }
  }

  const handleCopyResetLink = async () => {
    if (!resetLink) {
      return
    }

    try {
      await navigator.clipboard.writeText(
        resetLink,
      )

      setCopySuccess(true)

      window.setTimeout(() => {
        setCopySuccess(false)
      }, 2000)
    } catch (copyError) {
      console.error(
        'Impossible de copier le lien :',
        copyError,
      )
    }
  }

  const handleOpenResetLink = () => {
    if (!resetLink) {
      return
    }

    window.open(
      resetLink,
      '_blank',
      'noopener,noreferrer',
    )
  }

  const handleCloseModal = () => {
    setResetLink('')
    setCopySuccess(false)
  }

  return (
    <main className="login-page">
      <section className="login-container">
        <div className="login-brand">
          <span className="login-brand-mark">
            A
          </span>

          <span>
            AthlETS
          </span>
        </div>

        <div className="login-content">
          <div className="login-left">
            <h1>
              Mot de passe oublié?
              <br />
              Récupérez votre accès.
            </h1>

            <p>
              Entrez l’adresse courriel associée à votre
              compte. Un lien temporaire vous permettra
              de choisir un nouveau mot de passe.
            </p>

            <div className="athlete-visual">
              <div className="stats">
                <span>ÉTAPE 1</span>
                <strong>
                  Saisir votre courriel
                </strong>

                <span>ÉTAPE 2</span>
                <strong>
                  Consulter le message reçu
                </strong>

                <span>ÉTAPE 3</span>
                <strong>
                  Définir un mot de passe
                </strong>
              </div>
            </div>
          </div>

          <div className="login-card">
            <div className="card-logo">
              AthlETS
            </div>

            <h2>
              Mot de passe oublié
            </h2>

            <p className="card-subtitle">
              Entrez l’adresse courriel
              <br />
              associée à votre compte.
            </p>

            <form onSubmit={handleSubmit}>
              {error ? (
                <div className="error-message">
                  {error}
                </div>
              ) : null}

              <label htmlFor="reset-email">
                Adresse courriel
              </label>

              <input
                id="reset-email"
                type="email"
                placeholder="exemple@etsmtl.ca"
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target.value,
                  )
                }
                required
                disabled={loading}
              />

              <button
                type="submit"
                className="login-button"
                disabled={loading}
              >
                {loading
                  ? 'Envoi en cours...'
                  : 'Envoyer le lien'}
              </button>

              <button
                type="button"
                className="secondary-login-button"
                onClick={() =>
                  navigate('/connection')
                }
                disabled={loading}
              >
                Retour à la connexion
              </button>
            </form>
          </div>
        </div>

        <footer>
          © 2026 AthlETS. Tous droits réservés.
        </footer>
      </section>

      {resetLink && (
        <div
          className="link-modal-overlay"
          role="presentation"
        >
          <div
            className="link-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reset-modal-title"
          >
            <div className="link-modal__header">
              <h2 id="reset-modal-title">
                Lien de réinitialisation généré
              </h2>

              <p>
                Le lien est valide pendant une heure.
              </p>
            </div>

            <div className="link-modal__content">
              <p>
                Puisque l’envoi par courriel n’est pas
                encore configuré, utilisez ce lien pour
                réinitialiser le mot de passe.
              </p>

              <div className="link-modal__link">
                {resetLink}
              </div>

              {copySuccess && (
                <p className="link-modal__copy-success">
                  Lien copié.
                </p>
              )}
            </div>

            <div className="link-modal__actions">
              <button
                type="button"
                className="link-modal__button link-modal__button--secondary"
                onClick={handleCopyResetLink}
              >
                {copySuccess
                  ? 'Copié'
                  : 'Copier le lien'}
              </button>

              <button
                type="button"
                className="link-modal__button link-modal__button--secondary"
                onClick={handleOpenResetLink}
              >
                Ouvrir le lien
              </button>

              <button
                type="button"
                className="link-modal__button link-modal__button--primary"
                onClick={handleCloseModal}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
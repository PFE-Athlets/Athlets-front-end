import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/login.css'
import { authService } from '../api/authService'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()

    setError('')
    setSuccess('')

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

      setSuccess(
        'Si un compte actif correspond à cette adresse, un lien de réinitialisation sera envoyé.',
      )
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

  return (
    <main className="login-page">
      <section className="login-container">
        <div className="login-brand">AthlETS</div>

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
                <strong>Saisir votre courriel</strong>

                <span>ÉTAPE 2</span>
                <strong>Consulter le message reçu</strong>

                <span>ÉTAPE 3</span>
                <strong>
                  Définir un mot de passe
                </strong>
              </div>
            </div>
          </div>

          <div className="login-card">
            <div className="card-logo">AthlETS</div>

            <h2>Mot de passe oublié</h2>

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

              {success ? (
                <div className="success-message">
                  {success}
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
                  setEmail(event.target.value)
                }
                required
                disabled={loading || Boolean(success)}
              />

              <button
                type="submit"
                className="login-button"
                disabled={loading || Boolean(success)}
              >
                {loading
                  ? 'Envoi en cours...'
                  : 'Envoyer le lien'}
              </button>

              <button
                type="button"
                className="secondary-login-button"
                onClick={() =>
                  navigate('/connexion')
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
    </main>
  )
}
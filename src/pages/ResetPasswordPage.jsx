import { useState } from 'react'
import {
  useNavigate,
  useSearchParams,
} from 'react-router-dom'
import '../styles/login.css'
import { authService } from '../api/authService'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const token = searchParams.get('token')

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] =
    useState('')

  const [showNewPassword, setShowNewPassword] =
    useState(false)

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()

    setError('')
    setSuccess('')

    if (!token) {
      setError(
        'Le lien de réinitialisation est invalide ou incomplet.',
      )
      return
    }

    if (newPassword.length < 8) {
      setError(
        'Le mot de passe doit contenir au moins 8 caractères.',
      )
      return
    }

    if (newPassword !== confirmPassword) {
      setError(
        'Les mots de passe ne correspondent pas.',
      )
      return
    }

    setLoading(true)

    try {
      const result = await authService.resetPassword({
        token,
        newPassword,
        confirmPassword,
      })

      if (!result.success) {
        setError(
          result.error ??
            'Impossible de réinitialiser le mot de passe.',
        )
        return
      }

      setSuccess(
        'Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter.',
      )

      setTimeout(() => {
        navigate('/connexion')
      }, 1800)
    } catch (resetError) {
      console.error(
        'Erreur de réinitialisation :',
        resetError,
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
              Réinitialisez votre mot de passe.
              <br />
              Retrouvez votre espace AthlETS.
            </h1>

            <p>
              Définissez un nouveau mot de passe sécurisé
              afin de retrouver l’accès à votre profil,
              vos tests physiques et vos résultats.
            </p>

            <div className="athlete-visual">
              <div className="stats">
                <span>ACCÈS SÉCURISÉ</span>
                <strong>Nouveau mot de passe</strong>

                <span>PROTECTION</span>
                <strong>Lien temporaire</strong>

                <span>VALIDITÉ</span>
                <strong>
                  Une heure <em>maximum</em>
                </strong>
              </div>
            </div>
          </div>

          <div className="login-card">
            <div className="card-logo">AthlETS</div>

            <h2>Réinitialisation</h2>

            <p className="card-subtitle">
              Définissez votre nouveau mot de passe
              <br />
              afin de récupérer votre accès.
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

              <label htmlFor="new-password">
                Nouveau mot de passe
              </label>

              <div className="password-field">
                <input
                  id="new-password"
                  type={
                    showNewPassword
                      ? 'text'
                      : 'password'
                  }
                  placeholder="Entrez votre nouveau mot de passe"
                  value={newPassword}
                  onChange={(event) =>
                    setNewPassword(event.target.value)
                  }
                  required
                  disabled={loading || Boolean(success)}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowNewPassword(
                      (currentValue) =>
                        !currentValue,
                    )
                  }
                  disabled={loading || Boolean(success)}
                  aria-label={
                    showNewPassword
                      ? 'Masquer le mot de passe'
                      : 'Afficher le mot de passe'
                  }
                >
                  👁
                </button>
              </div>

              <label htmlFor="confirm-password">
                Confirmation du mot de passe
              </label>

              <div className="password-field">
                <input
                  id="confirm-password"
                  type={
                    showConfirmPassword
                      ? 'text'
                      : 'password'
                  }
                  placeholder="Confirmez votre nouveau mot de passe"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(
                      event.target.value,
                    )
                  }
                  required
                  disabled={loading || Boolean(success)}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      (currentValue) =>
                        !currentValue,
                    )
                  }
                  disabled={loading || Boolean(success)}
                  aria-label={
                    showConfirmPassword
                      ? 'Masquer la confirmation'
                      : 'Afficher la confirmation'
                  }
                >
                  👁
                </button>
              </div>

              <button
                type="submit"
                className="login-button"
                disabled={loading || Boolean(success)}
              >
                {loading
                  ? 'Réinitialisation en cours...'
                  : 'Réinitialiser mon mot de passe'}
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
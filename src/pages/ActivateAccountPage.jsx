import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import '../styles/login.css'
import { authService } from '../api/authService'

export default function ActivateAccountPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const token = searchParams.get('token')

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!token) {
      setError('Le lien d’activation est invalide ou incomplet.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }

    if (newPassword.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }

    setLoading(true)

    try {
      const result = await authService.activateAccount({
        token,
        newPassword,
        confirmPassword,
      })

      if (result.success) {
        setSuccess('Votre compte a été activé avec succès. Vous pouvez maintenant vous connecter.')

        setTimeout(() => {
          navigate('/connexion')
        }, 1800)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('Une erreur inattendue s’est produite.')
      console.error('Erreur activation:', err)
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
              Activez votre compte.
              <br />
              Rejoignez votre espace athlète.
            </h1>

            <p>
              Définissez votre mot de passe afin d’accéder à votre profil,
              consulter vos tests physiques et suivre votre progression.
            </p>

            <div className="athlete-visual">
              <div className="stats">
                <span>ACCÈS SÉCURISÉ</span>
                <strong>Compte privé</strong>

                <span>SUIVI ATHLÈTE</span>
                <strong>Tests & résultats</strong>

                <span>STATUT</span>
                <strong>
                  Activation <em>requise</em>
                </strong>
              </div>
            </div>
          </div>

          <div className="login-card">
            <div className="card-logo">AthlETS</div>

            <h2>Activation</h2>
            <p className="card-subtitle">
              Définissez votre mot de passe
              <br />
              pour activer votre compte.
            </p>

            <form onSubmit={handleSubmit}>
              {error && <div className="error-message">{error}</div>}
              {success && <div className="success-message">{success}</div>}

              <label>Nouveau mot de passe</label>
              <div className="password-field">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Entrez votre nouveau mot de passe"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={loading || success}
                />

                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  disabled={loading || success}
                >
                  👁
                </button>
              </div>

              <label>Confirmation du mot de passe</label>
              <div className="password-field">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirmez votre nouveau mot de passe"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading || success}
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading || success}
                >
                  👁
                </button>
              </div>

              <button
                type="submit"
                className="login-button"
                disabled={loading || success}
              >
                {loading ? 'Activation en cours...' : 'Activer mon compte'}
              </button>

              <button
                type="button"
                className="secondary-login-button"
                onClick={() => navigate('/connexion')}
                disabled={loading}
              >
                Retour à la connexion
              </button>
            </form>
          </div>
        </div>

        <footer>© 2026 AthlETS. Tous droits réservés.</footer>
      </section>
    </main>
  )
}
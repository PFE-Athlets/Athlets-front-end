import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import '../styles/login.css'

export default function LoginPage({ onLoginSuccess }) {

  const loginStore = useAuthStore((state) => state.login)

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await loginStore(username, password)

      if (result.success) {
        navigate('/')
      } else {
        setError(result.error)
        console.error('Erreur login:', result.error)
      }
    } catch (err) {
      setError('Une erreur inattendue s\'est produite')
      console.error('Erreur:', err)
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
              Optimisez la performance.
              <br />
              Suivez chaque progression.
            </h1>

            <p>
              AthlETS est la plateforme tout-en-un pour gérer, analyser et
              développer le potentiel de vos athlètes.
            </p>

            <div className="athlete-visual">
              <div className="stats">
                <span>VITESSE MAX</span>
                <strong>10,21 m/s</strong>

                <span>VO₂ MAX</span>
                <strong>62,4</strong>

                <span>CHARGE AIGÜE</span>
                <strong>
                  480 <em>(+12%)</em>
                </strong>
              </div>
            </div>
          </div>

          <div className="login-card">
            <div className="card-logo">AthlETS</div>

            <h2>Connexion</h2>
            <p className="card-subtitle">
              Connectez-vous à votre plateforme
              <br />
              de suivi des athlètes.
            </p>

            <form onSubmit={handleSubmit}>
              {error && <div className="error-message">{error}</div>}

              <label htmlFor="username-input">Nom d'utilisateur ou courriel</label>
              <input
                id="username-input"
                type="text"
                name="username"
                placeholder="Entrez votre nom d'utilisateur ou courriel"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
              />

              <label htmlFor="password-input">Mot de passe</label>
              <div className="password-field">
                <input
                  id="password-input"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Entrez votre mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  👁
                </button>
              </div>

              <a href="/" className="forgot-password">
                Mot de passe oublié ?
              </a>

              <button type="submit" className="login-button" disabled={loading}>
                {loading ? 'Connexion en cours...' : 'Se connecter'}
              </button>
            </form>
          </div>
        </div>

        <footer>© 2026 AthlETS. Tous droits réservés.</footer>
      </section>
    </main>
  )
}
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/login.css'
import athleteImage from '../assets/283808481.png'

export default function LoginPage() {
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()

    // Fake login pour le mockup
    navigate('/tableau-de-bord')
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
              <label>Nom d’utilisateur ou courriel</label>
              <input
                type="text"
                placeholder="Entrez votre nom d'utilisateur ou courriel"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />

              <label>Mot de passe</label>
              <div className="password-field">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Entrez votre mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  👁
                </button>
              </div>

              <a href="/" className="forgot-password">
                Mot de passe oublié ?
              </a>

              <button type="submit" className="login-button">
                Se connecter
              </button>
            </form>
          </div>
        </div>

        <footer>© 2026 AthlETS. Tous droits réservés.</footer>
      </section>
    </main>
  )
}
import './styles/physical-test-page-view.css'
import { Link } from 'react-router-dom'

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M11 5h2v14h-2z" />
      <path d="M5 11h14v2H5z" />
    </svg>
  )
}

const physicalTestStats = [
  {
    title: 'Testes physiques actifs',
    value: 3,
    trend: '12,4%',
    comparison: 'vs avr. 2024',
    icon: '👥',
    variant: 'blue',
  },
  {
    title: 'Nouveaux testes physiques',
    value: 8,
    trend: '33,3%',
    comparison: 'vs avr. 2024',
    icon: '👤+',
    variant: 'green',
  },
  {
    title: 'Testes physiques non actifs',
    value: 15,
    trend: '7,1%',
    comparison: 'vs avr. 2024',
    icon: '👤⊘',
    variant: 'gray',
  },
]

export default function PhysicalTestPageView() {
  return (
    <section className="athlete-page">
      <div className="athlete-page__top">
        <div className="athlete-stats">
          {physicalTestStats.map((stat) => (
            <article
              key={stat.title}
              className="athlete-stat-card"
            >
              <div>
                <p className="athlete-stat-card__title">
                  {stat.title}
                </p>

                <strong className="athlete-stat-card__value">
                  {stat.value}
                </strong>

                <div className="athlete-stat-card__trend">
                  <span>▲ {stat.trend}</span>
                  <small>{stat.comparison}</small>
                </div>
              </div>

              <div
                className={`athlete-stat-card__icon athlete-stat-card__icon--${stat.variant}`}
              >
                {stat.icon}
              </div>
            </article>
          ))}
        </div>

        <Link to="/tests-physiques/creer" className="athlete-create-button">
          <PlusIcon />
          <span>Créer un test physique</span>
        </Link>
      </div>
    </section>
  )
}
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import '../../styles/athlete-details.css'

const STATUS_CONFIG = {
  ACTIVE: {
    label: 'Actif',
    className: 'athlete-profile-status--active',
  },
  A_ACTIVER: {
    label: 'En attente',
    className: 'athlete-profile-status--pending',
  },
  INACTIVE: {
    label: 'Non actif',
    className: 'athlete-profile-status--inactive',
  },
}

export default function AthleteDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [athlete, setAthlete] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [canEdit, setCanEdit] = useState(false)

  useEffect(() => {
    const fetchAthlete = async () => {
      try {
        setLoading(true)
        setError('')
        setCanEdit(false)

        const athletesResponse = await fetch('http://localhost:8080/api/athlete/all', {
          method: 'GET',
          credentials: 'include',
          headers: {
            Accept: 'application/json',
          },
        })

        if (athletesResponse.ok) {
          const data = await athletesResponse.json()

          const foundAthlete = Array.isArray(data)
            ? data.find((item) => String(item.authUser?.id) === String(id))
            : null

          if (!foundAthlete) {
            throw new Error(
              'Athlète introuvable ou inaccessible avec vos permissions.',
            )
          }

          setAthlete(foundAthlete)
          setCanEdit(true)
          return
        }

        if (athletesResponse.status !== 403 && athletesResponse.status !== 401) {
          throw new Error(
            `Impossible de récupérer la fiche athlète. Erreur ${athletesResponse.status}.`,
          )
        }

        const currentResponse = await fetch('http://localhost:8080/api/athlete/current', {
          method: 'GET',
          credentials: 'include',
          headers: {
            Accept: 'application/json',
          },
        })

        if (currentResponse.status === 401) {
          throw new Error('Vous devez être connecté pour consulter cette fiche.')
        }

        if (currentResponse.status === 403) {
          throw new Error(
            'Vous n’êtes pas autorisé à consulter cette fiche athlète.',
          )
        }

        if (!currentResponse.ok) {
          throw new Error(
            `Impossible de récupérer votre fiche athlète. Erreur ${currentResponse.status}.`,
          )
        }

        const currentAthlete = await currentResponse.json()

        if (String(currentAthlete.authUser?.id) !== String(id)) {
          throw new Error(
            'Vous pouvez seulement consulter votre propre fiche athlète.',
          )
        }

        setAthlete(currentAthlete)
        setCanEdit(false)
      } catch (requestError) {
        console.error(
          'Erreur lors du chargement de la fiche athlète :',
          requestError,
        )

        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Une erreur est survenue lors du chargement de la fiche.',
        )
      } finally {
        setLoading(false)
      }
    }

    fetchAthlete()
  }, [id])

  const user = athlete?.authUser ?? {}

  const sports = useMemo(() => getAthleteSports(athlete), [athlete])
  const teams = useMemo(() => getAthleteTeams(athlete), [athlete])
  const positions = useMemo(() => getAthletePositions(athlete), [athlete])
  const disciplines = useMemo(() => getAthleteDisciplines(athlete), [athlete])

  const statusKey = user.accountStatus?.trim().toUpperCase()
  const statusConfig = STATUS_CONFIG[statusKey] ?? {
    label: user.accountStatus || 'Non spécifié',
    className: 'athlete-profile-status--inactive',
  }

  if (loading) {
    return (
      <section className="athlete-profile-page">
        <div className="athlete-profile-message">
          Chargement de la fiche athlète...
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="athlete-profile-page">
        <div className="athlete-profile-message athlete-profile-message--error">
          {error}
        </div>

        <div className="athlete-profile-actions">
          <button
            type="button"
            className="athlete-profile-btn athlete-profile-btn--secondary"
            onClick={() => navigate('/athletes')}
          >
            Retour
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="athlete-profile-page">
      <div className="athlete-profile-card">
        <section className="athlete-profile-section">
          <h2>Informations personnelles</h2>

          <div className="athlete-profile-grid athlete-profile-grid--two">
            <InfoItem
              icon={<UserIcon />}
              label="Prénom"
              value={user.firstName}
            />

            <InfoItem
              icon={<UserIcon />}
              label="Nom"
              value={user.lastName}
            />

            <InfoItem
              icon={<CalendarIcon />}
              label="Date de naissance"
              value={formatDate(athlete.birthDate)}
            />

            <InfoItem
              icon={<GenderIcon />}
              label="Sexe"
              value={formatGender(athlete.gender)}
            />

            <InfoItem
              icon={<MailIcon />}
              label="Courriel"
              value={user.email}
            />
          </div>
        </section>

        <section className="athlete-profile-section">
          <h2>Profil sportif</h2>

          <div className="athlete-profile-grid athlete-profile-grid--two">
            <InfoItem
              icon={<TrophyIcon />}
              label="Sport"
              value={
                sports.length > 0 ? <TagList items={sports} /> : 'Non spécifié'
              }
            />

            <InfoItem
              icon={<TargetIcon />}
              label="Position / Discipline"
              value={
                positions.length > 0 || disciplines.length > 0 ? (
                  <span>{[...positions, ...disciplines].join(', ')}</span>
                ) : (
                  'Non spécifié'
                )
              }
            />

            <InfoItem
              icon={<TeamIcon />}
              label="Équipe"
              value={
                teams.length > 0 ? <TagList items={teams} /> : 'Aucune équipe'
              }
            />

            <InfoItem
              icon={<RulerIcon />}
              label="Taille"
              value={
                athlete.heightMeters != null
                  ? `${athlete.heightMeters} m`
                  : 'Non spécifié'
              }
            />

            <InfoItem
              icon={<ScaleIcon />}
              label="Poids"
              value={
                athlete.weightKg != null
                  ? `${athlete.weightKg} kg`
                  : 'Non spécifié'
              }
            />

            <InfoItem
              icon={<ArmIcon />}
              label="Bras dominant"
              value={formatDominantSide(athlete.dominantArm)}
            />

            <InfoItem
              icon={<LegIcon />}
              label="Jambe dominante"
              value={formatDominantSide(athlete.dominantLeg)}
            />
          </div>
        </section>

        <section className="athlete-profile-section">
          <h2>Compte utilisateur</h2>

          <div className="athlete-profile-grid athlete-profile-grid--three">
            <InfoItem
              icon={<UserIcon />}
              label="Nom d'utilisateur"
              value={user.username}
            />

            <InfoItem
              icon={<ShieldIcon />}
              label="Statut du compte"
              value={
                <span
                  className={`athlete-profile-status ${statusConfig.className}`}
                >
                  {statusConfig.label}
                </span>
              }
            />

            <InfoItem
              icon={<LockIcon />}
              label="Type d’accès"
              value="Athlète"
            />
          </div>
        </section>

        <section className="athlete-profile-section">
          <h2>Historique médical et notes</h2>

          <div className="athlete-profile-notes">
            {athlete.injuryHistory?.trim() ||
              'Aucun historique médical significatif.'}
          </div>
        </section>

        <div className="athlete-profile-actions">
          <button
            type="button"
            className="athlete-profile-btn athlete-profile-btn--secondary"
            onClick={() => navigate(-1)}
          >
            Retour
          </button>

          {canEdit && (
            <Link
              to={`/athletes/${user.id}/modifier`}
              className="athlete-profile-btn athlete-profile-btn--primary"
            >
              Modifier le profil
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}

function InfoItem({ icon, label, value }) {
  return (
    <article className="athlete-profile-info">
      <div className="athlete-profile-info__icon" aria-hidden="true">
        {icon}
      </div>

      <div>
        <p className="athlete-profile-info__label">{label}</p>

        <div className="athlete-profile-info__value">
          {value || 'Non spécifié'}
        </div>
      </div>
    </article>
  )
}

function TagList({ items }) {
  return (
    <div className="athlete-profile-tags">
      {items.map((item) => (
        <span key={item} className="athlete-profile-tag">
          {item}
        </span>
      ))}
    </div>
  )
}

function IconBase({ children }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="athlete-profile-svg-icon"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  )
}

function UserIcon() {
  return (
    <IconBase>
      <path d="M20 21a8 8 0 0 0-16 0" />
      <circle cx="12" cy="7" r="4" />
    </IconBase>
  )
}

function CalendarIcon() {
  return (
    <IconBase>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M8 3v4" />
      <path d="M16 3v4" />
      <path d="M4 10h16" />
    </IconBase>
  )
}

function GenderIcon() {
  return (
    <IconBase>
      <circle cx="9" cy="9" r="4" />
      <path d="M12 12l6 6" />
      <path d="M15 18h3v-3" />
      <path d="M9 13v7" />
      <path d="M6 17h6" />
    </IconBase>
  )
}

function MailIcon() {
  return (
    <IconBase>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </IconBase>
  )
}

function TrophyIcon() {
  return (
    <IconBase>
      <path d="M8 4h8v4a4 4 0 0 1-8 0V4Z" />
      <path d="M8 6H5a2 2 0 0 0 2 4h1" />
      <path d="M16 6h3a2 2 0 0 1-2 4h-1" />
      <path d="M12 12v5" />
      <path d="M9 21h6" />
      <path d="M10 17h4" />
    </IconBase>
  )
}

function TargetIcon() {
  return (
    <IconBase>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="1" />
    </IconBase>
  )
}

function TeamIcon() {
  return (
    <IconBase>
      <path d="M17 21a5 5 0 0 0-10 0" />
      <circle cx="12" cy="9" r="3" />
      <path d="M3 21a4 4 0 0 1 4-4" />
      <path d="M21 21a4 4 0 0 0-4-4" />
      <path d="M6.5 8a2.5 2.5 0 0 0 0 5" />
      <path d="M17.5 8a2.5 2.5 0 0 1 0 5" />
    </IconBase>
  )
}

function RulerIcon() {
  return (
    <IconBase>
      <path d="M6 3h12v18H6z" />
      <path d="M10 7h4" />
      <path d="M10 11h3" />
      <path d="M10 15h4" />
    </IconBase>
  )
}

function ScaleIcon() {
  return (
    <IconBase>
      <path d="M7 20h10" />
      <path d="M9 20l1-9h4l1 9" />
      <path d="M8 11a4 4 0 0 1 8 0" />
      <path d="M12 11l2-3" />
    </IconBase>
  )
}

function ArmIcon() {
  return (
    <IconBase>
      <path d="M7 20c3-1 5-4 5-8V5" />
      <path d="M12 5c3 0 5 2 5 5v3" />
      <path d="M17 13c0 3-2 6-5 7" />
      <path d="M9 8h6" />
    </IconBase>
  )
}

function LegIcon() {
  return (
    <IconBase>
      <path d="M10 3v6l-2 5v7" />
      <path d="M14 3v7l2 5v6" />
      <path d="M8 21h4" />
      <path d="M14 21h4" />
    </IconBase>
  )
}

function ShieldIcon() {
  return (
    <IconBase>
      <path d="M12 22s7-3 7-10V5l-7-3-7 3v7c0 7 7 10 7 10Z" />
      <path d="M9 12l2 2 4-4" />
    </IconBase>
  )
}

function LockIcon() {
  return (
    <IconBase>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </IconBase>
  )
}

function getAthleteTeams(athlete) {
  if (!athlete?.teams) return []

  return [
    ...new Set(
      athlete.teams.map((team) => team.name).filter(Boolean),
    ),
  ]
}

function getAthleteSports(athlete) {
  if (!athlete) return []

  const teamSports =
    athlete.teams?.map((team) => team.sport?.name).filter(Boolean) ?? []

  const disciplineSports =
    athlete.disciplines
      ?.map((discipline) => discipline.sport?.name)
      .filter(Boolean) ?? []

  return [...new Set([...teamSports, ...disciplineSports])]
}

function getAthletePositions(athlete) {
  if (!athlete?.positions) return []

  return [
    ...new Set(
      athlete.positions.map((position) => position.name).filter(Boolean),
    ),
  ]
}

function getAthleteDisciplines(athlete) {
  if (!athlete?.disciplines) return []

  return [
    ...new Set(
      athlete.disciplines
        .map((discipline) => discipline.name)
        .filter(Boolean),
    ),
  ]
}

function formatDate(value) {
  if (!value) return 'Non spécifié'

  const date = new Date(`${value}T00:00:00`)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('fr-CA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

function formatGender(value) {
  const normalizedValue = value?.trim().toLowerCase()

  if (normalizedValue === 'female' || normalizedValue === 'femme') {
    return 'Féminin'
  }

  if (normalizedValue === 'male' || normalizedValue === 'homme') {
    return 'Masculin'
  }

  return value || 'Non spécifié'
}

function formatDominantSide(value) {
  const normalizedValue = value?.trim().toLowerCase()

  if (normalizedValue === 'right' || normalizedValue === 'droite') {
    return 'Droite'
  }

  if (normalizedValue === 'left' || normalizedValue === 'gauche') {
    return 'Gauche'
  }

  if (
    normalizedValue === 'both' ||
    normalizedValue === 'ambidextre' ||
    normalizedValue === 'les deux'
  ) {
    return 'Les deux'
  }

  return value || 'Non spécifié'
}
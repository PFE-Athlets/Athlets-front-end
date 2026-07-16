import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { athleteService } from '../../api/athleteService'
import '../../styles/athlete-details.css'

import {
  ArmIcon,
  UserIcon,
  CalendarDateIcon,
  GenderIcon,
  MailIcon,
  TrophyIcon,
  TargetIcon,
  TeamIcon,
  RulerIcon,
  ScaleIcon,
  LegIcon,
  ShieldIcon,
  LockIcon,
} from '../../components/Icons'

import {
  formatDate,
  formatGender,
  formatDominantSide,
} from '../../utils/athleteFormatters'

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

  useEffect(() => {
    const fetchAthlete = async () => {
      setLoading(true)
      setError('')

      const result = await athleteService.getAthleteById(id)

      if (!result.success) {
        console.error(
          'Erreur lors du chargement de la fiche athlète :',
          result.error,
        )

        setError(
          result.error ||
            'Une erreur est survenue lors du chargement de la fiche.',
        )
        setLoading(false)
        return
      }

      setAthlete(result.data)
      setLoading(false)
    }

    fetchAthlete()
  }, [id])

  const user = athlete?.authUser ?? {}

  const sports = useMemo(
    () => athleteService.helpers.getAthleteSports(athlete),
    [athlete],
  )

  const teams = useMemo(
    () => athleteService.helpers.getAthleteTeams(athlete),
    [athlete],
  )

  const positions = useMemo(
    () => athleteService.helpers.getAthletePositions(athlete),
    [athlete],
  )

  const disciplines = useMemo(
    () => athleteService.helpers.getAthleteDisciplines(athlete),
    [athlete],
  )

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
              icon={<CalendarDateIcon />}
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
                sports.length > 0 ? (
                  <TagList items={sports} />
                ) : (
                  'Non spécifié'
                )
              }
            />

            <InfoItem
              icon={<TargetIcon />}
              label="Position / Discipline"
              value={
                positions.length > 0 || disciplines.length > 0 ? (
                  <span>
                    {[...positions, ...disciplines].join(', ')}
                  </span>
                ) : (
                  'Non spécifié'
                )
              }
            />

            <InfoItem
              icon={<TeamIcon />}
              label="Équipe"
              value={
                teams.length > 0 ? (
                  <TagList items={teams} />
                ) : (
                  'Aucune équipe'
                )
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
        </div>
      </div>
    </section>
  )
}

function InfoItem({ icon, label, value }) {
  return (
    <article className="athlete-profile-info">
      <div
        className="athlete-profile-info__icon"
        aria-hidden="true"
      >
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
        <span
          key={item}
          className="athlete-profile-tag"
        >
          {item}
        </span>
      ))}
    </div>
  )
}
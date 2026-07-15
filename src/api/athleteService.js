import api from './config'

const extractError = (error, fallback) => {
  const data = error.response?.data

  if (typeof data === 'string') {
    return data
  }

  return (
    data?.message ??
    data?.error ??
    data?.erreur ??
    fallback
  )
}

const normalizeText = (value) =>
  String(value ?? '')
    .trim()
    .toLowerCase()

const getAthleteStatus = (athlete) => {
  const rawStatus = athlete?.authUser?.accountStatus
    ?.trim()
    .toUpperCase()

  if (rawStatus === 'ACTIVE') {
    return 'active'
  }

  if (rawStatus === 'A_ACTIVER') {
    return 'pending'
  }

  return 'inactive'
}

const getAthleteTeams = (athlete) => {
  const teams =
    athlete?.teams
      ?.map((team) => team.name)
      .filter(Boolean) ?? []

  return [...new Set(teams)]
}

const getAthleteSports = (athlete) => {
  const teamSports =
    athlete?.teams
      ?.map((team) => team.sport?.name)
      .filter(Boolean) ?? []

  const disciplineSports =
    athlete?.disciplines
      ?.map((discipline) => discipline.sport?.name)
      .filter(Boolean) ?? []

  return [
    ...new Set([
      ...teamSports,
      ...disciplineSports,
    ]),
  ]
}

const getAthletePositions = (athlete) => {
  const positions =
    athlete?.positions
      ?.map((position) => position.name)
      .filter(Boolean) ?? []

  return [...new Set(positions)]
}

const getAthleteDisciplines = (athlete) => {
  const disciplines =
    athlete?.disciplines
      ?.map((discipline) => discipline.name)
      .filter(Boolean) ?? []

  return [...new Set(disciplines)]
}

const mapAthleteDisplayItem = (athlete) => {
  const user = athlete?.authUser ?? {}
  const teams = getAthleteTeams(athlete)
  const sports = getAthleteSports(athlete)
  const positions = getAthletePositions(athlete)
  const disciplines = getAthleteDisciplines(athlete)

  return {
    id: String(user.id ?? ''),
    firstName: user.firstName ?? '',
    lastName: user.lastName ?? '',
    fullName: [user.firstName, user.lastName]
      .filter(Boolean)
      .join(' '),
    username: user.username ?? '',
    email: user.email ?? '',
    accountStatus: user.accountStatus ?? '',
    status: getAthleteStatus(athlete),

    birthDate: athlete?.birthDate ?? '',
    gender: athlete?.gender ?? '',
    phone: athlete?.phone ?? '',
    heightMeters: athlete?.heightMeters ?? '',
    weightKg: athlete?.weightKg ?? '',
    dominantArm: athlete?.dominantArm ?? '',
    dominantLeg: athlete?.dominantLeg ?? '',
    injuryHistory: athlete?.injuryHistory ?? '',

    teams,
    sports,
    positions,
    disciplines,

    teamIds:
      athlete?.teams
        ?.map((team) => team.id)
        .filter((teamId) => teamId != null) ?? [],

    positionIds:
      athlete?.positions
        ?.map((position) => position.id)
        .filter((positionId) => positionId != null) ?? [],

    disciplineIds:
      athlete?.disciplines
        ?.map((discipline) => discipline.id)
        .filter((disciplineId) => disciplineId != null) ?? [],

    raw: athlete,
  }
}

const mapAthleteUpdatePayload = (form) => ({
  phone: form.phone?.trim() || null,
  weightKg: Number(form.weightKg),
  injuryHistory: form.injuryHistory?.trim() || null,
  teamIds: form.teamIds ?? [],
  positionIds: form.positionIds ?? [],
  disciplineIds: form.disciplineIds ?? [],
})

const findAthleteById = (athletes, athleteId) =>
  athletes.find(
    (athlete) =>
      String(athlete?.authUser?.id) === String(athleteId) ||
      String(athlete?.id) === String(athleteId),
  )

export const athleteService = {
  createAthlete: async (form) => {
    try {
      await api.post('/api/athlete/create', {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        birthDate: form.birthDate,
        gender: form.gender,
        email: form.email.trim(),
        username: form.username.trim(),

        accountStatus: form.accountStatus,

        heightMeters:
          form.heightMeters !== ''
            ? Number(form.heightMeters)
            : null,

        weightKg:
          form.weightKg !== ''
            ? Number(form.weightKg)
            : null,

        dominantArm: form.dominantArm || null,
        dominantLeg: form.dominantLeg || null,

        injuryHistory:
          form.injuryHistory?.trim() || null,

        athleteTeamName: form.athleteTeamName,
      })

      return {
        success: true,
        message: 'L’athlète a été créé avec succès.',
      }
    } catch (error) {
      return {
        success: false,
        status: error.response?.status,
        error: extractError(
          error,
          'Impossible de créer l’athlète',
        ),
      }
    }
  },

  getAllAthletes: async () => {
    try {
      const response = await api.get('/api/athlete/all')
      const rawList = Array.isArray(response.data)
        ? response.data
        : []

      return {
        success: true,
        data: rawList,
      }
    } catch (error) {
      return {
        success: false,
        status: error.response?.status,
        error: extractError(
          error,
          'Erreur lors du chargement des athlètes',
        ),
      }
    }
  },

  getDisplayAthletes: async () => {
    try {
      const response = await api.get('/api/athlete/all')
      const rawList = Array.isArray(response.data)
        ? response.data
        : []

      return {
        success: true,
        data: rawList.map(mapAthleteDisplayItem),
      }
    } catch (error) {
      return {
        success: false,
        status: error.response?.status,
        error: extractError(
          error,
          'Erreur lors du chargement des athlètes',
        ),
      }
    }
  },

  getAthleteById: async (athleteId) => {
    try {
      const response = await api.get('/api/athlete/all')
      const rawList = Array.isArray(response.data)
        ? response.data
        : []

      const athlete = findAthleteById(
        rawList,
        athleteId,
      )

      if (!athlete) {
        return {
          success: false,
          status: 404,
          error:
            'Athlète introuvable ou inaccessible avec vos permissions.',
        }
      }

      return {
        success: true,
        data: athlete,
        displayData:
          mapAthleteDisplayItem(athlete),
        canEdit: true,
      }
    } catch (error) {
      const status = error.response?.status

      if (status !== 401 && status !== 403) {
        return {
          success: false,
          status,
          error: extractError(
            error,
            'Erreur lors du chargement de la fiche athlète',
          ),
        }
      }

      return athleteService.getCurrentAthleteByRouteId(
        athleteId,
      )
    }
  },

  getCurrentAthlete: async () => {
    try {
      const response = await api.get(
        '/api/athlete/current',
      )

      return {
        success: true,
        data: response.data,
        displayData:
          mapAthleteDisplayItem(response.data),
      }
    } catch (error) {
      return {
        success: false,
        status: error.response?.status,
        error: extractError(
          error,
          'Erreur lors du chargement de votre fiche athlète',
        ),
      }
    }
  },

  getCurrentAthleteByRouteId: async (
    athleteId,
  ) => {
    const result =
      await athleteService.getCurrentAthlete()

    if (!result.success) {
      return result
    }

    if (
      String(result.data?.authUser?.id) !==
      String(athleteId)
    ) {
      return {
        success: false,
        status: 403,
        error:
          'Vous pouvez seulement consulter votre propre fiche athlète.',
      }
    }

    return {
      ...result,
      canEdit: false,
    }
  },

  updateAthlete: async (athleteId, form) => {
    try {
      await api.put(
        `/api/athlete/${athleteId}`,
        mapAthleteUpdatePayload(form),
      )

      return {
        success: true,
        message:
          'Le profil athlète a été modifié avec succès.',
      }
    } catch (error) {
      return {
        success: false,
        status: error.response?.status,
        error: extractError(
          error,
          'Impossible d’enregistrer les modifications',
        ),
      }
    }
  },

  deactivateAthlete: async (athleteId) => {
    try {
      await api.put(
        `/api/athlete/${athleteId}/deactivate`,
      )

      return {
        success: true,
        message:
          'Le compte de l’athlète a été désactivé avec succès.',
      }
    } catch (error) {
      return {
        success: false,
        status: error.response?.status,
        error: extractError(
          error,
          'Impossible de désactiver l’athlète',
        ),
      }
    }
  },

  helpers: {
    normalizeText,
    getAthleteStatus,
    getAthleteTeams,
    getAthleteSports,
    getAthletePositions,
    getAthleteDisciplines,
    mapAthleteDisplayItem,
  },
}
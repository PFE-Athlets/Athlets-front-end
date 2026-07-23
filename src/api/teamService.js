import api from './config'

const extractError = (error, fallback) => {
  const data = error.response?.data
  return typeof data === 'string' ? data : data?.message ?? fallback
}

const mapTeamDisplayItem = (item) => {
  const team = item?.team ?? {}
  const sport = team?.sport ?? {}

  return {
    id: String(team?.id ?? ''),
    name: team?.name ?? 'Équipe sans nom',
    sport: sport?.name ?? '—',
    athletesCount: item?.numberOfAthletes ?? 0,
    headCoach: item?.headCoachName ?? '—',
    headCoachId: item?.headCoachId ? String(item.headCoachId) : '',
  }
}

const mapSportOption = (item) => ({
  id: String(item?.sportId ?? ''),
  name: item?.sportName ?? 'Sport',
})

const mapCoachOption = (item) => ({
  id: String(item?.coachId ?? ''),
  name: item?.coachName ?? 'Coach',
})

const mapSubcoachItem = (item) => ({
  id: String(item?.coachId ?? ''),
  name: item?.subcoachName ?? 'Coach',
})

export const teamService = {
  getSportOptions: async () => {
    try {
      const response = await api.get('/api/sport/sports')
      const rawList = Array.isArray(response.data) ? response.data : []
      const options = rawList
        .filter((item) => item?.sportId != null)
        .map(mapSportOption)

      return {
        success: true,
        data: options,
      }
    } catch (error) {
      return {
        success: false,
        status: error.response?.status,
        error: extractError(error, 'Impossible de charger la liste des sports.'),
      }
    }
  },

  getCoachOptions: async () => {
    try {
      const response = await api.get('/api/coach/coaches')
      const rawList = Array.isArray(response.data) ? response.data : []
      const options = rawList
        .filter((item) => item?.coachId != null)
        .map(mapCoachOption)

      return {
        success: true,
        data: options,
      }
    } catch (error) {
      return {
        success: false,
        status: error.response?.status,
        error: extractError(error, 'Impossible de charger la liste des coachs.'),
      }
    }
  },

  getSubcoachesByTeamId: async (teamId) => {
    try {
      const response = await api.get(`/api/team/subcoaches/${teamId}`)
      const rawList = Array.isArray(response.data) ? response.data : []
      const subcoaches = rawList
        .filter((item) => item?.coachId != null)
        .map(mapSubcoachItem)

      return {
        success: true,
        data: subcoaches,
      }
    } catch (error) {
      return {
        success: false,
        status: error.response?.status,
        error: extractError(error, 'Impossible de charger les coachs secondaires.'),
      }
    }
  },

  getDisplayTeams: async () => {
    try {
      const response = await api.get('/api/team/teams')
      const rawList = Array.isArray(response.data) ? response.data : []
      return { success: true, data: rawList.map(mapTeamDisplayItem) }
    } catch (error) {
      return {
        success: false,
        status: error.response?.status,
        error: extractError(error, 'Erreur lors du chargement des équipes'),
      }
    }
  },

  getDisplayTeamById: async (teamId) => {
    const result = await teamService.getDisplayTeams()

    if (!result.success) {
      return result
    }

    const team = result.data.find((item) => String(item.id) === String(teamId))

    if (!team) {
      return {
        success: false,
        status: 404,
        error: 'Equipe introuvable ou inaccessible avec vos permissions.',
      }
    }



    return {
      success: true,
      data: team,
    }
  },

  createTeam: async (payload) => {
    try {
      await api.post('/api/team', payload)

      return {
        success: true,
      }
    } catch (error) {
      return {
        success: false,
        status: error.response?.status,
        error: extractError(error, 'Impossible de créer cette équipe.'),
      }
    }
  },

  modifyTeam: async (teamId, payload) => {
    try {
      await api.patch(`/api/team/modify/${teamId}`, payload)

      return {
        success: true,
      }
    } catch (error) {
      return {
        success: false,
        status: error.response?.status,
        error: extractError(error, 'Impossible de modifier cette équipe.'),
      }
    }
  },
}

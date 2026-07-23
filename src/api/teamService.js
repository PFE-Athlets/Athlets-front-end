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

export const teamService = {
  getDisplayTeams: async () => {
    try {
      const response = await api.get('/api/team/teams')
      const rawList = Array.isArray(response.data) ? response.data : []
      return { success: true, data: rawList.map(mapTeamDisplayItem) }
    } catch (error) {
      return { success: false, error: extractError(error, 'Erreur lors du chargement des équipes') }
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
        error: 'Equipe introuvable.',
      }
    }

    return {
      success: true,
      data: team,
    }
  },
}

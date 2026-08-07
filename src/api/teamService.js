import api from './config'

const extractError = (error, fallback) => {
  const data = error.response?.data

  return typeof data === 'string'
    ? data
    : data?.message ?? fallback
}

const mapTeamDisplayItem = (item) => {
  const team = item?.team ?? {}
  const sport = team?.sport ?? {}

  return {
    id: String(team?.id ?? ''),

    name:
      team?.name ?? 'Équipe sans nom',

    sport:
      sport?.name ?? '—',

    sportId:
      sport?.id != null
        ? String(sport.id)
        : '',

    athletesCount:
      item?.numberOfAthletes ?? 0,

    headCoach:
      item?.headCoachName ?? '—',

    headCoachId:
      item?.headCoachId != null
        ? String(item.headCoachId)
        : '',
  }
}

export const teamService = {
  getDisplayTeams: async () => {
    try {
      const response = await api.get(
        '/api/team/teams',
      )

      const rawList = Array.isArray(
        response.data,
      )
        ? response.data
        : []

      return {
        success: true,
        data: rawList.map(
          mapTeamDisplayItem,
        ),
      }
    } catch (error) {
      return {
        success: false,
        status: error.response?.status,
        error: extractError(
          error,
          'Erreur lors du chargement des équipes',
        ),
      }
    }
  },

  getDisplayTeamById: async (teamId) => {
    const result =
      await teamService.getDisplayTeams()

    if (!result.success) {
      return result
    }

    const team = result.data.find(
      (item) =>
        String(item.id) ===
        String(teamId),
    )

    if (!team) {
      return {
        success: false,
        error: 'Équipe introuvable.',
      }
    }

    return {
      success: true,
      data: team,
    }
  },

  getDisciplinesAndPositionsBySportId:
    async (sportId) => {
      try {
        const response = await api.get(
          `/api/sport/disciplines-positions/${sportId}`,
        )

        return {
          success: true,
          data: {
            disciplines:
              Array.isArray(
                response.data?.disciplines,
              )
                ? response.data.disciplines
                : [],

            positions:
              Array.isArray(
                response.data?.positions,
              )
                ? response.data.positions
                : [],
          },
        }
      } catch (error) {
        return {
          success: false,
          status:
            error.response?.status,

          error: extractError(
            error,
            'Impossible de charger les positions et disciplines.',
          ),
        }
      }
    },
}
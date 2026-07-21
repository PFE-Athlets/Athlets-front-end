import api from './config'

const extractError = (error, fallback) => {
  const data = error.response?.data
  return typeof data === 'string' ? data : data?.message ?? fallback
}

const mapKineDisplayItem = (item) => {
  const rawId = item?.kineId ?? item?.id ?? item?.kinesiologistId ?? item?.userId
  const rawName = item?.kineName ?? item?.name ?? item?.fullName ?? item?.username

  return {
    id: rawId != null ? String(rawId) : '',
    name: typeof rawName === 'string' && rawName.trim() !== '' ? rawName : 'Kiné',
  }
}

export const kineService = {
  getDisplayKinesiologists: async () => {
    try {
      const response = await api.get('/api/kine/kinesiologists')
      const rawList = Array.isArray(response.data) ? response.data : []
      const options = rawList
        .map(mapKineDisplayItem)
        .filter((item) => item.id !== '')

      return { success: true, data: options }
    } catch (error) {
      return {
        success: false,
        error: extractError(error, 'Impossible de charger la liste des kines.'),
      }
    }
  },

  getDisplayKinesiologistsByTeamId: async (teamId) => {
    try {
      const response = await api.get(`/api/team/kinesiologists/${teamId}`)
      const rawList = Array.isArray(response.data) ? response.data : []
      const options = rawList
        .map(mapKineDisplayItem)
        .filter((item) => item.id !== '')

      return { success: true, data: options }
    } catch (error) {
      return {
        success: false,
        error: extractError(error, 'Impossible de charger les kines de cette equipe.'),
      }
    }
  },
}

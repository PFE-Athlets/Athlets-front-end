import api from './config'

const extractError = (error, fallback) => {
  const data = error.response?.data
  return typeof data === 'string' ? data : data?.message ?? fallback
}

export const physicalTestService = {
  getAll: async () => {
    try {
      const response = await api.get('/api/physicalTest')
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: extractError(error, 'Erreur lors du chargement des tests physiques') }
    }
  },

  create: async (payload) => {
    try {
      await api.post('/api/physicalTest/create', payload)
      return { success: true }
    } catch (error) {
      return { success: false, error: extractError(error, 'Erreur lors de la création du test physique') }
    }
  },
}

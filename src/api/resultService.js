import api from './config'

const extractError = (error, fallback) => {
  const data = error.response?.data
  return typeof data === 'string' ? data : data?.message ?? fallback
}

export const resultService = {
  getAllForUser: async (params = {}) => {
    try {
      const response = await api.get('/api/result', { params });
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: extractError(error, 'Erreur lors du chargement des résultats de tests physiques') }
    }
  },

  assignToAthlete: async (payload) => {
    try {
      await api.post('/api/result/assign', payload)
      return { success: true }
    } catch (error) {
      return { success: false, error: extractError(error, 'Erreur lors de l\'assignation de tests') }
    }
  },

  submitResult: async (payload) => {
    try {
      await api.put('/api/result/submit', payload)
      return { success: true }
    } catch (error) {
      return { success: false, error: extractError(error, 'Erreur lors de la soumission du test') }
    }
  },

  cancelSubmission: async (testResultId) => {
    try {
      await api.put(`/api/result/cancel/${testResultId}`)
      return { success: true }
    } catch (error) {
      return { success: false, error: extractError(error, 'Erreur lors de l\'annulation de la soumission') }
    }
  },

  verifyResult: async (testResultId, approved) => {
    try {
      await api.put(`/api/result/verify/${testResultId}/${approved}`)
      return { success: true }
    } catch (error) {
      return { success: false, error: extractError(error, 'Erreur lors de la vérification du test') }
    }
  },
}
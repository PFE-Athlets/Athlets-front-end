import api from './config'

const extractError = (error, fallback) => {
  const data = error.response?.data

  return typeof data === 'string'
    ? data
    : data?.message ?? fallback
}

export const physicalTestService = {
  getAll: async () => {
    try {
      const response = await api.get('/api/physicalTest')

      return {
        success: true,
        data: response.data ?? [],
      }
    } catch (error) {
      return {
        success: false,
        error: extractError(
          error,
          'Erreur lors du chargement des tests physiques',
        ),
      }
    }
  },

  getPhysicalQualities: async () => {
    try {
      const response = await api.get('/api/physical_tests')

      return {
        success: true,
        data: response.data ?? [],
      }
    } catch (error) {
      return {
        success: false,
        error: extractError(
          error,
          'Erreur lors du chargement des qualités physiques',
        ),
      }
    }
  },

  getEquipments: async () => {
    try {
      const response = await api.get('/api/equipments')

      return {
        success: true,
        data: response.data ?? [],
      }
    } catch (error) {
      return {
        success: false,
        error: extractError(
          error,
          'Erreur lors du chargement des équipements',
        ),
      }
    }
  },

  getUnits: async () => {
    try {
      const response = await api.get('/api/units')

      return {
        success: true,
        data: response.data ?? [],
      }
    } catch (error) {
      return {
        success: false,
        error: extractError(
          error,
          'Erreur lors du chargement des unités de mesure',
        ),
      }
    }
  },

  create: async (payload) => {
    try {
      const response = await api.post(
        '/api/physicalTest/create',
        payload,
      )

      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      return {
        success: false,
        error: extractError(
          error,
          'Erreur lors de la création du test physique',
        ),
      }
    }
  },
}
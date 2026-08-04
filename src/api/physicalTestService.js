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

  getPhysicalTestById: async (physicalTestId) => {
    const result = await physicalTestService.getAll()

    if (!result.success) {
      return result
    }

    const testPhysique = result.data.find((item) => String(item.id) === String(physicalTestId))

    if (!testPhysique) {
      return {
        success: false,
        error: 'Test physique introuvable.',
      }
    }

    return {
      success: true,
      data: testPhysique,
    }
  },

  getPhysicalQualities: async () => {
    try {
      const response = await api.get('/api/physicalTest/qualities')

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
      const response = await api.get('/api/physicalTest/equipments')

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
      const response = await api.get('/api/physicalTest/units')

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


  getByAllBatteries: async () => {
    try {
      const response = await api.get(
        `/api/physicalTest/battery`,
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
          'Erreur lors du chargement du test physique',
        ),
      }
    }
  },

  getDisplayBatterieById: async (batterieId) => {
    const result = await physicalTestService.getByAllBatteries()

    if (!result.success) {
      return result
    }

    const batterie = result.data.find((item) => String(item.id) === String(batterieId))

    if (!batterie) {
      return {
        success: false,
        error: 'Batterie introuvable.',
      }
    }

    return {
      success: true,
      data: batterie,
    }
  },

  create: async (payload) => {
    try {
      const response = await api.post(
        `/api/physicalTest/battery/create`,
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
          'Impossible de créer la batterie de tests.',
        ),
      }
    }
  },
}
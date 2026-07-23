import api from './config'

const extractError = (error, fallback) => {
  const data = error.response?.data

  return typeof data === 'string'
    ? data
    : data?.message ?? fallback
}

const normalizeList = (data) => {
  if (Array.isArray(data)) {
    return data
  }

  if (Array.isArray(data?.batterieTests)) {
    return data.batterieTests
  }

  if (Array.isArray(data?.batteries)) {
    return data.batteries
  }

  if (Array.isArray(data?.testBatteries)) {
    return data.testBatteries
  }

  if (Array.isArray(data?.content)) {
    return data.content
  }

  return []
}

export const batterieTestsService = {
  getAll: async () => {
    try {
      const response = await api.get('/api/batterieTests')

      return {
        success: true,
        data: normalizeList(response.data),
      }
    } catch (error) {
      return {
        success: false,
        data: [],
        error: extractError(
          error,
          'Impossible de charger les batteries de tests.',
        ),
      }
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(
        `/api/batterieTests/${id}`,
      )

      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      return {
        success: false,
        data: null,
        error: extractError(
          error,
          'Impossible de charger la batterie de tests.',
        ),
      }
    }
  },

  create: async (payload) => {
    try {
      const response = await api.post(
        '/api/batterieTests/create',
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

  update: async (id, payload) => {
    try {
      const response = await api.put(
        `/api/batterieTests/${id}`,
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
          'Impossible de modifier la batterie de tests.',
        ),
      }
    }
  },

  deactivate: async (id) => {
    try {
      const response = await api.put(
        `/api/batterieTests/${id}/deactivate`,
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
          'Impossible de désactiver la batterie de tests.',
        ),
      }
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(
        `/api/batterieTests/${id}`,
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
          'Impossible de supprimer la batterie de tests.',
        ),
      }
    }
  },
}
import api from './config'

export const authService = {
  login: async (username, password) => {
    try {
      const response = await api.post('/api/auth/login', {
        username,
        password,
      })
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || 'Erreur lors de la connexion',
      }
    }
  },

  logout: async () => {
    try {
      const response = await api.post('/api/auth/logout')
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || 'Erreur lors de la déconnexion',
      }
    }
  },
}

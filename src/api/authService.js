import api from './config'

const extractError = (error, fallback) => {
  const data = error.response?.data

  if (typeof data === 'string') {
    return data
  }

  return (
    data?.message ??
    data?.error ??
    data?.erreur ??
    fallback
  )
}

export const authService = {
  login: async (username, password) => {
    try {
      const response = await api.post(
        '/api/auth/login',
        {
          username,
          password,
        },
      )

      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      return {
        success: false,
        status: error.response?.status,
        error: extractError(
          error,
          'Erreur lors de la connexion',
        ),
      }
    }
  },

  logout: async () => {
    try {
      const response = await api.post(
        '/api/auth/logout',
      )

      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      return {
        success: false,
        status: error.response?.status,
        error: extractError(
          error,
          'Erreur lors de la déconnexion',
        ),
      }
    }
  },

  activateAccount: async ({
    token,
    newPassword,
    confirmPassword,
  }) => {
    try {
      const response = await api.post(
        '/api/auth/activate',
        {
          token,
          newPassword,
          confirmPassword,
        },
      )

      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      return {
        success: false,
        status: error.response?.status,
        error: extractError(
          error,
          'Impossible d’activer le compte.',
        ),
      }
    }
  },

  requestPasswordReset: async (payload) => {
    try {
      const response = await api.post(
        '/api/auth/password-reset/request',
        payload,
      )

      return {
        success: true,
        data: response.data,
        message:
          'Le lien de réinitialisation a été généré.',
      }
    } catch (error) {
      return {
        success: false,
        status: error.response?.status,
        error: extractError(
          error,
          'Impossible de générer le lien de réinitialisation.',
        ),
      }
    }
  },

  resetPassword: async (payload) => {
    try {
      const response = await api.post(
        '/api/auth/password-reset/confirm',
        payload,
      )

      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      return {
        success: false,
        status: error.response?.status,
        error: extractError(
          error,
          'Impossible de réinitialiser le mot de passe.',
        ),
      }
    }
  },

  deactivateAthlete: async (userId) => {
    try {
      await api.put(
        `/api/auth/${userId}/deactivate`,
      )

      return {
        success: true,
        message:
          'Le compte de l’athlète a été désactivé avec succès.',
      }
    } catch (error) {
      return {
        success: false,
        status: error.response?.status,
        error: extractError(
          error,
          'Impossible de désactiver l’athlète',
        ),
      }
    }
  },
}
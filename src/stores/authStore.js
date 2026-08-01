import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { authService } from '../api/authService'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (username, password) => {
        set({ isLoading: true, error: null })
        
        const response = await authService.login(username, password)
        
        if (response.success) {
          set({
            user: response.data,
            isAuthenticated: true,
            isLoading: false
          })
        } else {
          set({ 
            error: response.error, 
            isLoading: false 
          })
        }
        return response
      },

      logout: async () => {
        set({ isLoading: true })
        
        const response = await authService.logout()
        
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null
        })
        return response
      },

      hasAccessLevel: (requiredLevel) => {
        const currentUser = get().user
        if (!currentUser) return false
        
        return currentUser.accessLevel >= requiredLevel
      }
    }),
    {
      name: 'auth-session-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)
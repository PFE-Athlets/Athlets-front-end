import { create } from 'zustand'
import { resultService } from '@/api/resultService'

export const useResultStore = create((set, get) => ({
  results: [],
  isLoading: false,
  error: null,
  filters: {
    search: '',
    status: '',
    category: ''
  },

  setFilter: async (key, value) => {
    set((state) => ({
      filters: { ...state.filters, [key]: value }
    }))
  },

  resetFilters: () => set({
    filters: {
      search: '',
      status: '',
      category: ''
    }
  }),

  getFilteredResults: () => {
    const { results, filters } = get()
    const search = (filters.search || '').trim().toLowerCase()
    const status = filters.status || ''
    const category = filters.category || ''
 
    return results.filter((result) => {
      if (status && result.status !== status) return false
      if (category && result.category !== category) return false
      if (search) {
        const name = (result.physicalTestName || '').toLowerCase()
        if (!name.includes(search)) return false
      }
      return true
    })
  },

  fetchResults: async () => {
    set({ isLoading: true, error: null })
    const currentFilters = get().filters
    
    const response = await resultService.getAllForUser(currentFilters)

    if (response.success) {
      set({ results: response.data.content || response.data || [] })
    } else {
      set({ error: response.error })
    }
    set({ isLoading: false })
  },

  assignTestToAthletes: async (payload) => {
    set({ isLoading: true })
    const response = await resultService.assignToAthlete(payload)

    if (response.success) {
      await get().fetchResults()
    } else {
      set({ error: response.error })
    }
    set({ isLoading: false })
    return response
  },

  submitAthleteResult: async (payload) => {
    set({ isLoading: true })
    const response = await resultService.submitResult(payload)

    if (response.success) {
      await get().fetchResults()
    } else {
      set({ error: response.error })
    }
    set({ isLoading: false })
    return response
  },

  cancelSubmission: async (testResultId) => {
    set({ isLoading: true })
    const response = await resultService.cancelSubmission(testResultId)

    if (response.success) {
      await get().fetchResults()
    } else {
      set({ error: response.error })
    }
    set({ isLoading: false })
    return response
  },

  verifyAthleteResult: async (testResultId, approved) => {
    set({ isLoading: true })
    const response = await resultService.verifyResult(testResultId, approved)

    if (response.success) {
      await get().fetchResults()
    } else {
      set({ error: response.error })
    }
    set({ isLoading: false })
    return response
  },
}))
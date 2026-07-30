import { create } from 'zustand'
import { resultService } from '@/api/resultService'

// L'API renvoie le test physique dans un objet imbriqué (result.test).
// On l'aplatit ici pour que les composants lisent des champs simples.
const normalizeResult = (result) => {
  const test = result.test || {}
  return {
    ...result,
    physicalTestName: result.physicalTestName ?? test.name ?? '',
    unit: result.unit ?? test.unit ?? '',
    protocol: result.protocol ?? test.protocol ?? '',
    proofNeeded: result.proofNeeded ?? test.proof ?? '',
    category: result.category ?? test.category ?? '',
  }
}

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
      const rawResults = response.data?.content || response.data || []
      set({ results: rawResults.map(normalizeResult) })
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
import { create } from 'zustand'
import { resultService } from '../api/resultService'

export const useResultStore = create((set, get) => ({
  results: [],
  pagination: {
    page: 0,
    size: 20,
    totalElements: 0,
    totalPages: 0,
  },
  isLoading: false,
  error: null,

  fetchResults: async (page = 0, size = 20) => {
    set({ isLoading: true, error: null })
    const response = await resultService.getAllForUser({ page, size })

    if (response.success) {
      set({
        results: response.data.content || [],
        pagination: {
          page: response.data.number,
          size: response.data.size,
          totalElements: response.data.totalElements,
          totalPages: response.data.totalPages,
        },
      })
    } else {
      set({ error: response.error })
    }
    set({ isLoading: false })
  },

  assignTestToAthletes: async (payload) => {
    set({ isLoading: true })
    const response = await resultService.assignToAthlete(payload)

    if (response.success) {
      const { page, size } = get().pagination
      await get().fetchResults(page, size)
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
      const { page, size } = get().pagination
      await get().fetchResults(page, size)
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
      const { page, size } = get().pagination
      await get().fetchResults(page, size)
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
      const { page, size } = get().pagination
      await get().fetchResults(page, size)
    } else {
      set({ error: response.error })
    }
    set({ isLoading: false })
    return response
  },
}))
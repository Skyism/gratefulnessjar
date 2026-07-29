import { create } from 'zustand'
import type { Moment, CreateMomentInput, UpdateMomentInput } from '@/types'
import * as momentService from '@/lib/services/momentService'

/**
 * Moment Store State
 */
interface MomentState {
  // Data
  moments: Moment[]
  selectedMoment: Moment | null

  // UI State
  isLoading: boolean
  error: string | null

  // Actions
  loadMoments: () => Promise<void>
  createMoment: (input: CreateMomentInput) => Promise<Moment>
  updateMoment: (id: string, updates: UpdateMomentInput) => Promise<Moment>
  deleteMoment: (id: string) => Promise<void>
  selectMoment: (moment: Moment | null) => void
  clearError: () => void
}

/**
 * Sort moments newest first, tiebreaking same-day moments by creation time
 */
function sortMoments(moments: Moment[]): Moment[] {
  return [...moments].sort(
    (a, b) =>
      b.moment_date.localeCompare(a.moment_date) || b.created_at - a.created_at
  )
}

/**
 * Zustand store for moment state management
 *
 * Provides centralized state for all moments and actions
 * Includes optimistic updates for better UX
 */
export const useMomentStore = create<MomentState>((set) => ({
  // Initial state
  moments: [],
  selectedMoment: null,
  isLoading: false,
  error: null,

  /**
   * Load all moments from the database
   */
  loadMoments: async () => {
    set({ isLoading: true, error: null })
    try {
      const moments = await momentService.getAllMoments()
      set({ moments, isLoading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load moments',
        isLoading: false,
      })
    }
  },

  /**
   * Create a new moment
   * Uses optimistic update for instant UI feedback
   */
  createMoment: async (input: CreateMomentInput) => {
    set({ error: null })
    try {
      const moment = await momentService.createMoment(input)

      // Optimistic update
      set((state) => ({
        moments: sortMoments([moment, ...state.moments]),
      }))

      return moment
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create moment'
      set({ error: message })
      throw error
    }
  },

  /**
   * Update an existing moment
   * Uses optimistic update (re-sorts in case moment_date changed)
   */
  updateMoment: async (id: string, updates: UpdateMomentInput) => {
    set({ error: null })
    try {
      const updatedMoment = await momentService.updateMoment(id, updates)

      // Optimistic update
      set((state) => ({
        moments: sortMoments(
          state.moments.map((m) => (m.id === id ? updatedMoment : m))
        ),
        selectedMoment:
          state.selectedMoment?.id === id ? updatedMoment : state.selectedMoment,
      }))

      return updatedMoment
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to update moment'
      set({ error: message })
      throw error
    }
  },

  /**
   * Delete a moment
   * Uses optimistic update
   */
  deleteMoment: async (id: string) => {
    set({ error: null })
    try {
      await momentService.deleteMoment(id)

      // Optimistic update
      set((state) => ({
        moments: state.moments.filter((m) => m.id !== id),
        selectedMoment:
          state.selectedMoment?.id === id ? null : state.selectedMoment,
      }))
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete moment'
      set({ error: message })
      throw error
    }
  },

  /**
   * Select a moment (for detail view)
   */
  selectMoment: (moment: Moment | null) => {
    set({ selectedMoment: moment })
  },

  /**
   * Clear error message
   */
  clearError: () => {
    set({ error: null })
  },
}))

/**
 * Get moment count
 */
export const useMomentCount = () => {
  const moments = useMomentStore((state) => state.moments)
  return moments.length
}

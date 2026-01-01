import { create } from 'zustand'
import type { Entry, CreateEntryInput, UpdateEntryInput } from '@/types'
import * as entryService from '@/lib/services/entryService'
import { getTodayDateString } from '@/lib/services/dateService'

/**
 * Entry Store State
 */
interface EntryState {
  // Data
  entries: Entry[]
  todayEntry: Entry | null
  selectedEntry: Entry | null

  // UI State
  isLoading: boolean
  error: string | null

  // Actions
  loadEntries: () => Promise<void>
  loadTodayEntry: () => Promise<void>
  createEntry: (input: CreateEntryInput) => Promise<Entry>
  createTodayEntry: (input: Omit<CreateEntryInput, 'entry_date'>) => Promise<Entry>
  updateEntry: (id: string, updates: UpdateEntryInput) => Promise<Entry>
  deleteEntry: (id: string) => Promise<void>
  selectEntry: (entry: Entry | null) => void
  clearError: () => void
}

/**
 * Zustand store for entry state management
 *
 * Provides centralized state for all entries and actions
 * Includes optimistic updates for better UX
 */
export const useEntryStore = create<EntryState>((set, get) => ({
  // Initial state
  entries: [],
  todayEntry: null,
  selectedEntry: null,
  isLoading: false,
  error: null,

  /**
   * Load all entries from the database
   */
  loadEntries: async () => {
    set({ isLoading: true, error: null })
    try {
      const entries = await entryService.getAllEntries()
      set({ entries, isLoading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load entries',
        isLoading: false,
      })
    }
  },

  /**
   * Load today's entry
   */
  loadTodayEntry: async () => {
    set({ error: null })
    try {
      const todayEntry = await entryService.getTodayEntry()
      set({ todayEntry })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load today\'s entry',
      })
    }
  },

  /**
   * Create a new entry
   * Uses optimistic update for instant UI feedback
   */
  createEntry: async (input: CreateEntryInput) => {
    set({ error: null })
    try {
      const entry = await entryService.createEntry(input)

      // Optimistic update
      set((state) => ({
        entries: [entry, ...state.entries].sort((a, b) =>
          b.entry_date.localeCompare(a.entry_date)
        ),
        todayEntry:
          input.entry_date === getTodayDateString()
            ? entry
            : state.todayEntry,
      }))

      return entry
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create entry'
      set({ error: message })
      throw error
    }
  },

  /**
   * Create entry for today
   */
  createTodayEntry: async (input: Omit<CreateEntryInput, 'entry_date'>) => {
    const today = getTodayDateString()
    return get().createEntry({ ...input, entry_date: today })
  },

  /**
   * Update an existing entry
   * Uses optimistic update
   */
  updateEntry: async (id: string, updates: UpdateEntryInput) => {
    set({ error: null })
    try {
      const updatedEntry = await entryService.updateEntry(id, updates)

      // Optimistic update
      set((state) => ({
        entries: state.entries.map((e) => (e.id === id ? updatedEntry : e)),
        todayEntry:
          state.todayEntry?.id === id ? updatedEntry : state.todayEntry,
        selectedEntry:
          state.selectedEntry?.id === id ? updatedEntry : state.selectedEntry,
      }))

      return updatedEntry
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to update entry'
      set({ error: message })
      throw error
    }
  },

  /**
   * Delete an entry
   * Uses optimistic update
   */
  deleteEntry: async (id: string) => {
    set({ error: null })
    try {
      await entryService.deleteEntry(id)

      // Optimistic update
      set((state) => ({
        entries: state.entries.filter((e) => e.id !== id),
        todayEntry: state.todayEntry?.id === id ? null : state.todayEntry,
        selectedEntry:
          state.selectedEntry?.id === id ? null : state.selectedEntry,
      }))
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete entry'
      set({ error: message })
      throw error
    }
  },

  /**
   * Select an entry (for detail view)
   */
  selectEntry: (entry: Entry | null) => {
    set({ selectedEntry: entry })
  },

  /**
   * Clear error message
   */
  clearError: () => {
    set({ error: null })
  },
}))

/**
 * Selector hooks for common queries
 */

/**
 * Get entries by date range
 */
export const useEntriesInRange = (startDate: string, endDate: string) => {
  const entries = useEntryStore((state) => state.entries)
  return entries.filter(
    (entry) => entry.entry_date >= startDate && entry.entry_date <= endDate
  )
}

/**
 * Get entry by date
 */
export const useEntryByDate = (dateString: string) => {
  const entries = useEntryStore((state) => state.entries)
  return entries.find((entry) => entry.entry_date === dateString) || null
}

/**
 * Get entry count
 */
export const useEntryCount = () => {
  const entries = useEntryStore((state) => state.entries)
  return entries.length
}

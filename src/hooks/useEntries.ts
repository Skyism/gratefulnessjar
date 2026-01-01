import { useEffect } from 'react'
import { useEntryStore } from '@/store/entryStore'

/**
 * Custom hook for entry operations
 *
 * Provides convenient access to entry store with automatic data loading
 */
export function useEntries() {
  const {
    entries,
    todayEntry,
    selectedEntry,
    isLoading,
    error,
    loadEntries,
    loadTodayEntry,
    createEntry,
    createTodayEntry,
    updateEntry,
    deleteEntry,
    selectEntry,
    clearError,
  } = useEntryStore()

  // Load entries on mount
  useEffect(() => {
    loadEntries()
    loadTodayEntry()
  }, [loadEntries, loadTodayEntry])

  return {
    // Data
    entries,
    todayEntry,
    selectedEntry,
    isLoading,
    error,

    // Actions
    loadEntries,
    loadTodayEntry,
    createEntry,
    createTodayEntry,
    updateEntry,
    deleteEntry,
    selectEntry,
    clearError,
  }
}

/**
 * Hook for accessing just today's entry
 */
export function useTodayEntry() {
  const { todayEntry, isLoading, loadTodayEntry } = useEntryStore()

  useEffect(() => {
    loadTodayEntry()
  }, [loadTodayEntry])

  return {
    todayEntry,
    isLoading,
  }
}

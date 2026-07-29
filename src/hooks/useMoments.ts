import { useEffect } from 'react'
import { useMomentStore } from '@/store/momentStore'

/**
 * Custom hook for moment operations
 *
 * Provides convenient access to moment store with automatic data loading
 */
export function useMoments() {
  const {
    moments,
    selectedMoment,
    isLoading,
    error,
    loadMoments,
    createMoment,
    updateMoment,
    deleteMoment,
    selectMoment,
    clearError,
  } = useMomentStore()

  // Load moments on mount
  useEffect(() => {
    loadMoments()
  }, [loadMoments])

  return {
    // Data
    moments,
    selectedMoment,
    isLoading,
    error,

    // Actions
    loadMoments,
    createMoment,
    updateMoment,
    deleteMoment,
    selectMoment,
    clearError,
  }
}

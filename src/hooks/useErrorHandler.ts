'use client'

import { useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { logError, logApiError, logAuthError, ErrorContext } from '@/lib/error-monitoring'

interface UseErrorHandlerReturn {
  handleError: (error: Error | string, context?: ErrorContext) => void
  handleApiError: (
    endpoint: string,
    method: string,
    response: Response,
    error?: Error | string,
    requestData?: any
  ) => void
  handleAuthError: (action: string, error: Error | string, metadata?: any) => void
  handleAsyncError: <T>(
    asyncFn: () => Promise<T>,
    context?: ErrorContext
  ) => Promise<T | null>
}

/**
 * Custom hook for centralized error handling
 * Provides consistent error logging with user context
 */
export function useErrorHandler(): UseErrorHandlerReturn {
  const { data: session } = useSession()

  const handleError = useCallback((error: Error | string, context?: ErrorContext) => {
    const enrichedContext: ErrorContext = {
      ...context,
      userId: session?.user?.id,
      userRole: session?.user?.role
    }
    
    logError(error, enrichedContext)
  }, [session])

  const handleApiError = useCallback((
    endpoint: string,
    method: string,
    response: Response,
    error?: Error | string,
    requestData?: any
  ) => {
    const errorMessage = error || `API Error: ${response.status} ${response.statusText}`
    logApiError(endpoint, method, response.status, errorMessage, requestData)
  }, [])

  const handleAuthError = useCallback((
    action: string, 
    error: Error | string, 
    metadata?: any
  ) => {
    logAuthError(action, error, {
      ...metadata,
      userId: session?.user?.id,
      userRole: session?.user?.role
    })
  }, [session])

  const handleAsyncError = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    context?: ErrorContext
  ): Promise<T | null> => {
    try {
      return await asyncFn()
    } catch (error) {
      handleError(error as Error, context)
      return null
    }
  }, [handleError])

  return {
    handleError,
    handleApiError,
    handleAuthError,
    handleAsyncError
  }
}

/**
 * Higher-order function to wrap API calls with error handling
 */
export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  context?: ErrorContext
) {
  return async (...args: T): Promise<R | null> => {
    try {
      return await fn(...args)
    } catch (error) {
      logError(error as Error, context)
      return null
    }
  }
}

/**
 * Utility to create safe async functions that won't throw
 */
export function createSafeAsync<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  fallbackValue: R,
  context?: ErrorContext
) {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args)
    } catch (error) {
      logError(error as Error, context)
      return fallbackValue
    }
  }
}

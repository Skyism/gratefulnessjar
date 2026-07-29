import type { IncomingMessage, ServerResponse } from 'node:http'

export type NextFunction = (error?: unknown) => void

export function sendJson(
  response: ServerResponse,
  statusCode: number,
  payload: unknown
): void {
  response.statusCode = statusCode
  response.setHeader('Content-Type', 'application/json')
  response.end(JSON.stringify(payload))
}

export function sendNoContent(response: ServerResponse): void {
  response.statusCode = 204
  response.end()
}

export async function readJsonBody<T>(request: IncomingMessage): Promise<T> {
  let body = ''

  for await (const chunk of request) {
    body += typeof chunk === 'string' ? chunk : chunk.toString('utf8')
  }

  return JSON.parse(body) as T
}

/**
 * Map a repository error onto an HTTP status code.
 *
 * @param notFoundMessage the repository's "missing record" message, which
 * maps to 404; validation failures map to 400 and anything else to 500.
 */
export function getStatusCode(error: unknown, notFoundMessage: string): number {
  if (!(error instanceof Error)) {
    return 500
  }

  if (error.message === notFoundMessage) {
    return 404
  }

  if (
    error.message.includes('required') ||
    error.message.includes('Invalid') ||
    error.message.includes('already exists') ||
    error.message.includes('Cannot create') ||
    error.message.includes('between 1 and 7') ||
    error.message.includes('characters or less')
  ) {
    return 400
  }

  return 500
}

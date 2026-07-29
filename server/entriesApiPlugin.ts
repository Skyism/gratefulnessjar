import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin } from 'vite'
import type { CreateEntryInput, Entry, UpdateEntryInput } from '../src/types'
import { createEntryRepository } from './entryRepository'

type NextFunction = (error?: unknown) => void

function sendJson(
  response: ServerResponse,
  statusCode: number,
  payload: unknown
): void {
  response.statusCode = statusCode
  response.setHeader('Content-Type', 'application/json')
  response.end(JSON.stringify(payload))
}

function sendNoContent(response: ServerResponse): void {
  response.statusCode = 204
  response.end()
}

async function readJsonBody<T>(request: IncomingMessage): Promise<T> {
  let body = ''

  for await (const chunk of request) {
    body += typeof chunk === 'string' ? chunk : chunk.toString('utf8')
  }

  return JSON.parse(body) as T
}

function getStatusCode(error: unknown): number {
  if (!(error instanceof Error)) {
    return 500
  }

  if (error.message === 'Entry not found') {
    return 404
  }

  if (
    error.message.includes('required') ||
    error.message.includes('Invalid') ||
    error.message.includes('already exists') ||
    error.message.includes('Cannot create') ||
    error.message.includes('between 1 and 7')
  ) {
    return 400
  }

  return 500
}

function createEntriesApiMiddleware() {
  const repository = createEntryRepository()

  return async (
    request: IncomingMessage,
    response: ServerResponse,
    next: NextFunction
  ): Promise<void> => {
    if (!request.url) {
      next()
      return
    }

    const url = new URL(request.url, 'http://localhost')

    if (!url.pathname.startsWith('/api/entries')) {
      next()
      return
    }

    try {
      const method = request.method || 'GET'
      const entryDateMatch = url.pathname.match(/^\/api\/entries\/date\/([^/]+)$/)
      const entryIdMatch = url.pathname.match(/^\/api\/entries\/([^/]+)$/)

      if (method === 'GET' && url.pathname === '/api/entries') {
        sendJson(response, 200, await repository.getAllEntries())
        return
      }

      if (method === 'GET' && url.pathname === '/api/entries/today') {
        sendJson(response, 200, await repository.getTodayEntry())
        return
      }

      if (method === 'GET' && url.pathname === '/api/entries/random') {
        sendJson(response, 200, await repository.getRandomEntry())
        return
      }

      if (method === 'GET' && entryDateMatch) {
        sendJson(
          response,
          200,
          await repository.getEntryByDate(decodeURIComponent(entryDateMatch[1]))
        )
        return
      }

      if (method === 'GET' && entryIdMatch) {
        sendJson(
          response,
          200,
          await repository.getEntryById(decodeURIComponent(entryIdMatch[1]))
        )
        return
      }

      if (method === 'POST' && url.pathname === '/api/entries') {
        const input = await readJsonBody<CreateEntryInput>(request)
        sendJson(response, 201, await repository.createEntry(input))
        return
      }

      if (method === 'POST' && url.pathname === '/api/entries/import') {
        const entries = await readJsonBody<Entry[]>(request)
        sendJson(response, 200, await repository.importEntries(entries))
        return
      }

      if (method === 'PATCH' && entryIdMatch) {
        const updates = await readJsonBody<UpdateEntryInput>(request)
        sendJson(
          response,
          200,
          await repository.updateEntry(decodeURIComponent(entryIdMatch[1]), updates)
        )
        return
      }

      if (method === 'DELETE' && entryIdMatch) {
        await repository.deleteEntry(decodeURIComponent(entryIdMatch[1]))
        sendNoContent(response)
        return
      }

      sendJson(response, 404, { message: 'Route not found' })
    } catch (error) {
      sendJson(response, getStatusCode(error), {
        message: error instanceof Error ? error.message : 'Unexpected server error',
      })
    }
  }
}

export function entriesApiPlugin(): Plugin {
  const middleware = createEntriesApiMiddleware()

  return {
    name: 'entries-api',
    configureServer(server) {
      server.middlewares.use(middleware)
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware)
    },
  }
}

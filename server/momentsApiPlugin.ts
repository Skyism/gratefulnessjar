import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin } from 'vite'
import type { CreateMomentInput, Moment, UpdateMomentInput } from '../src/types'
import { createMomentRepository } from './momentRepository'
import {
  getStatusCode,
  readJsonBody,
  sendJson,
  sendNoContent,
  type NextFunction,
} from './apiHttp'

function createMomentsApiMiddleware() {
  const repository = createMomentRepository()

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

    if (!url.pathname.startsWith('/api/moments')) {
      next()
      return
    }

    try {
      const method = request.method || 'GET'
      const momentIdMatch = url.pathname.match(/^\/api\/moments\/([^/]+)$/)

      if (method === 'GET' && url.pathname === '/api/moments') {
        sendJson(response, 200, await repository.getAllMoments())
        return
      }

      if (method === 'GET' && momentIdMatch) {
        sendJson(
          response,
          200,
          await repository.getMomentById(decodeURIComponent(momentIdMatch[1]))
        )
        return
      }

      if (method === 'POST' && url.pathname === '/api/moments') {
        const input = await readJsonBody<CreateMomentInput>(request)
        sendJson(response, 201, await repository.createMoment(input))
        return
      }

      if (method === 'POST' && url.pathname === '/api/moments/import') {
        const moments = await readJsonBody<Moment[]>(request)
        sendJson(response, 200, await repository.importMoments(moments))
        return
      }

      if (method === 'PATCH' && momentIdMatch) {
        const updates = await readJsonBody<UpdateMomentInput>(request)
        sendJson(
          response,
          200,
          await repository.updateMoment(
            decodeURIComponent(momentIdMatch[1]),
            updates
          )
        )
        return
      }

      if (method === 'DELETE' && momentIdMatch) {
        await repository.deleteMoment(decodeURIComponent(momentIdMatch[1]))
        sendNoContent(response)
        return
      }

      sendJson(response, 404, { message: 'Route not found' })
    } catch (error) {
      sendJson(response, getStatusCode(error, 'Moment not found'), {
        message: error instanceof Error ? error.message : 'Unexpected server error',
      })
    }
  }
}

export function momentsApiPlugin(): Plugin {
  const middleware = createMomentsApiMiddleware()

  return {
    name: 'moments-api',
    configureServer(server) {
      server.middlewares.use(middleware)
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware)
    },
  }
}

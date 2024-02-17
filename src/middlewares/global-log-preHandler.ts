import { FastifyRequest } from 'fastify'

export async function checkGlobalPreHandler(request: FastifyRequest) {
  console.log(`[${request.method}] ${request.url}`)
}

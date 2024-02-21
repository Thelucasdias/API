import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import { randomUUID } from 'node:crypto'
import { checkIfSessionIdExists } from '../middlewares/check-session-id-exists'

export async function transactionsRoutes(app: FastifyInstance) {
  app.get('/', { preHandler: [checkIfSessionIdExists] }, async (request) => {
    const { sessionID } = request.cookies
    const transactions = await knex('transactions')
      .where('session_id', sessionID)
      .select()
    return { transactions }
  })

  app.get('/:id', { preHandler: [checkIfSessionIdExists] }, async (request) => {
    const getTransactionParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = getTransactionParamsSchema.parse(request.params)

    const { sessionID } = request.cookies

    const transactions = await knex('transactions')
      .where({ session_id: sessionID, id })
      .first()

    return { transactions }
  })

  app.get(
    '/summary',
    { preHandler: [checkIfSessionIdExists] },
    async (request) => {
      const { sessionID } = request.cookies
      const summary = await knex('transactions')
        .where('session_id', sessionID)
        .sum('amount', { as: 'amount' })
        .first()

      return { summary }
    },
  )

  app.post(
    '/',
    { preHandler: [checkIfSessionIdExists] },
    async (request, reply) => {
      const createTransactionBodySchema = z.object({
        title: z.string(),
        amount: z.number(),
        type: z.enum(['income', 'expanse']),
      })

      const { title, amount, type } = createTransactionBodySchema.parse(
        request.body,
      )

      let { sessionID } = request.cookies

      if (!sessionID) {
        sessionID = randomUUID()

        reply.cookie('sessionID', sessionID, {
          path: '/',
          maxAge: 60 * 60 * 24 * 7, // 7 days
        })
      }

      await knex('transactions').insert({
        id: randomUUID(),
        title,
        amount: type === 'income' ? amount : amount * -1,
        session_id: sessionID,
      })

      return reply.status(201).send()
    },
  )
}

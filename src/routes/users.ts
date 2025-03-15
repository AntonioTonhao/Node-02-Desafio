import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'

// Route para criação de usuario com o metodo post adicionando sessionID (Cookies)

export async function usersRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const createTransactionsSchema = z.object({
      name: z.string(),
      email: z.string().email(),
    })

    const { name, email } = createTransactionsSchema.parse(request.body)

    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()

      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
    }

    await knex('users').insert({
      user_id: randomUUID(),
      name,
      email,
      session_id: sessionId,
    })

    return reply.status(201).send()
  })

  app.get('/', async () => {
    const buscar = await knex('users').select()

    return { buscar }
  })
}

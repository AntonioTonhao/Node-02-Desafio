import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

export default function mealsRoutes(app: FastifyInstance) {
  app.post(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const createMealBodySchema = z.object({
        title: z.string(),
        description: z.string(),
        isOnDiet: z.boolean(),
        date: z.coerce.date(),
      })

      const { title, description, isOnDiet, date } = createMealBodySchema.parse(
        request.body,
      )

      await knex('meals').insert({
        meals_id: randomUUID(),
        title,
        description,
        is_on_diet: isOnDiet,
        date: date.getTime(),
        id_user: request.user?.user_id,
      })

      return reply.status(201).send()
    },
  )

  app.get('/', { preHandler: [checkSessionIdExists] }, async (request) => {
    const meals = await knex('meals')
      .where({ id_user: request.user?.user_id })
      .select()
    return {
      meals,
    }
  })

  app.get(
    '/:mealsId',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const getMealsParamsSchema = z.object({
        mealsId: z.string().uuid(),
      })

      const { mealsId } = getMealsParamsSchema.parse(request.params)

      const meal = await knex('meals').where({ meals_Id: mealsId }).first()

      if (!meal) {
        return reply.status(404).send({ error: 'Meal not found' })
      }

      return reply.send({ meal })
    },
  )
}

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

      const meal = await knex('meals')
        .where({
          meals_id: mealsId,
          id_user: request.user?.user_id,
        })
        .first()

      if (!meal) {
        return reply.status(404).send({ error: 'Meal not found' })
      }

      return reply.send({ meal })
    },
  )

  app.delete(
    '/:mealsId',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const getMealsSchemaDelete = z.object({
        mealsId: z.string().uuid(),
      })

      const { mealsId } = getMealsSchemaDelete.parse(request.params)

      const meal = await knex('meals')
        .where({
          meals_id: mealsId,
          id_user: request.user?.user_id,
        })
        .first()
        .delete()

      if (!meal) {
        reply.status(404).send({
          error: 'Meal not found',
        })
      }
      return reply.status(204).send()
    },
  )

  app.put(
    '/:mealsId',
    { preHandler: checkSessionIdExists },
    async (request, reply) => {
      const getMealsSchemaDelete = z.object({
        mealsId: z.string().uuid(),
      })

      const { mealsId } = getMealsSchemaDelete.parse(request.params)

      const updateMeal = z.object({
        title: z.string(),
        description: z.string(),
        date: z.coerce.date(),
        isOnDiet: z.boolean(),
      })

      const { title, description, date, isOnDiet } = updateMeal.parse(
        request.body,
      )

      const checkMeal = await knex('meals').where({ meals_id: mealsId }).first()

      if (!checkMeal) {
        reply.status(404).send({
          error: 'Meal not found',
        })
      }

      await knex('meals').where({ meals_id: mealsId }).update({
        title,
        description,
        date: date.getTime(),
        is_on_diet: isOnDiet,
      })

      return reply.status(204).send()
    },
  )

  app.get(
    '/metrics',
    { preHandler: checkSessionIdExists },
    async (request, reply) => {
      const TotalMealsOnDiet = await knex('meals')
        .where({
          id_user: request.user?.user_id,
          is_on_diet: true,
        })
        .count('meals_id', { as: 'total' })
        .first()

      const TotalMealsOffDiet = await knex('meals')
        .where({
          id_user: request.user?.user_id,
          is_on_diet: false,
        })
        .count('meals_id', { as: 'total' })
        .first()

      const TotalMeals = await knex('meals')
        .where({
          id_user: request.user?.user_id,
        })
        .orderBy('date', 'desc')

      const { bestSequence } = TotalMeals.reduce(
        (acc, meals) => {
          if (meals.is_on_diet) {
            acc.currentSequence += 1
          } else {
            acc.currentSequence = 0
          }

          if (acc.currentSequence > acc.bestSequence) {
            acc.bestSequence = acc.currentSequence
          }

          return acc
        },
        { bestSequence: 0, currentSequence: 0 },
      )

      return reply.send({
        TotalMeals: TotalMeals.length,
        TotalMealsOnDiet: TotalMealsOnDiet?.total,
        TotalMealsOffDiet: TotalMealsOffDiet?.total,
        bestSequence,
      })
    },
  )
}

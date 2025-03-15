// eslint-disable-next-line
import { Knex } from 'knex'

declare module 'knex/types/tables' {
  export interface users {
    users: {
      user_id: string
      name: string
      email: string
      created_at: string
      session_id: string
      updated_at: string
    }
  }
  export interface meals {
    users: {
      meals_id: string
      title: string
      description: string
      created_at: string
      session_id: string
      date: number
      id_user: string
      is_on_diet: boolean
      updated_at: string
    }
  }
}

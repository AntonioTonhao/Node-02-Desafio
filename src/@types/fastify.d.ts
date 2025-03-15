import 'fastify'

declare module 'fastify' {
  export interface FastifyRequest {
    user?: {
      user_id: string
      session_id: string
      name: string
      email: string
      created_at: string
      updated_at: string
    }
  }
}

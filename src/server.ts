import fastify from 'fastify'
import { env } from './env'
import { transactionsRoutes } from './routes/transactions'
import cookie from '@fastify/cookie'
import { checkGlobalPreHandler } from './middlewares/global-log-preHandler'

const app = fastify()

app.register(cookie)
app.addHook('preHandler', checkGlobalPreHandler)
app.register(transactionsRoutes, {
  prefix: 'transactions',
})

app.get('/test', () => {
  return 'hello world!'
})

app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log('listening on port: 3000')
  })

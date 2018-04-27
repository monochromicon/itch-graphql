import { microGraphiql, microGraphql } from 'apollo-server-micro'
import micro, { send } from 'micro'
import { get, post, router } from 'microrouter'
import { makeExecutableSchema } from 'graphql-tools'

import { typeDefs, resolvers } from './types'

const schema = makeExecutableSchema({ typeDefs, resolvers })

const graphqlHandler = microGraphql((req, res) => {
  return {
    schema,
    context: {
      authorization:
        req.headers.authorization || `Bearer ${process.env.ITCH_TOKEN}`
    }
  }
})
const graphiqlHandler = microGraphiql({ endpointURL: '/graphql' })

const server = function (port, graphiql = true) {
  return micro(
    router(
      get('/graphql', graphqlHandler),
      post('/graphql', graphqlHandler),
      get(
        '/graphiql',
        graphiql ? graphiqlHandler : (req, res) => send(res, 405, 'sorry bub')
      ),
      (req, res) => send(res, 404, 'whatcha lookin for (oh four)')
    )
  ).listen(port, () => {
    console.log(`hmu on port ${port}`)
  })
}

export { server, typeDefs, resolvers }

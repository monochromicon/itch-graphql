import { request, plugins } from 'popsicle'

import { typeDefs as userType } from './User'
import { typeDefs as gameType } from './Game'
import { typeDefs as purchaseType } from './Purchase'
import { typeDefs as downloadKeyType } from './DownloadKey'

const scopeType = `type Scopes {
  scopes: [String]
  expires_at: String
}`

const typeDefs = [
  `type Query {
  # Returns information about the enabled API key/JWT's scopes
  info: Scopes
  # Returns the profile of the authenticated user
  me: User
  # Returns the games of the authenticated user
  games: [Game]
  # Returns the purchases of a game for a given user/email
  purchases(gameId: Int!, userId: Int, email: String): [Purchase]
  # Returns a game's download key for a given user/email/key ID
  downloadKey(gameId: Int!, userId: Int, email: String, key: String): DownloadKey
}`,
  userType,
  gameType,
  scopeType,
  purchaseType,
  downloadKeyType
]

const buildParams = (user, email, downloadKey) => {
  let params = ''
  if (user || email || downloadKey) {
    params = '?'.concat(
      user ? `user_id=${user}` : '',
      email ? `email=${email}` : '',
      downloadKey ? `download_key=${downloadKey}` : ''
    )
  }
  return params
}

const requestParams = ctx => ({
  method: 'GET',
  headers: {
    Authorization: ctx.authorization
  }
})

const resolvers = {
  Query: {
    info (_, args, context) {
      return request({
        url: 'https://itch.io/api/1/key/credentials/info',
        ...requestParams(context)
      }).use(plugins.parse('json'))
    },
    me (_, args, context) {
      return request({
        url: 'https://itch.io/api/1/key/me',
        ...requestParams(context)
      })
        .use(plugins.parse('json'))
        .then(res => {
          return res.body.user
        })
    },
    games (_, args, context) {
      return request({
        url: 'https://itch.io/api/1/key/my-games',
        ...requestParams(context)
      })
        .use(plugins.parse('json'))
        .then(res => {
          return res.body.games
        })
    },
    purchases (_, args, context) {
      return request({
        url: `https://itch.io/api/1/key/game/${
          args.gameId
        }/purchases${buildParams(args.userId, args.email)}`,
        ...requestParams(context)
      })
        .use(plugins.parse('json'))
        .then(res => {
          return res.body.purchases
        })
    },
    downloadKey (_, args, context) {
      return request({
        url: `https://itch.io/api/1/key/game/${
          args.gameId
        }/download_keys${buildParams(args.userId, args.email, args.key)}`,
        ...requestParams(context)
      })
        .use(plugins.parse('json'))
        .then(res => {
          return res.body.download_key
        })
    }
  }
}

export { typeDefs, resolvers }

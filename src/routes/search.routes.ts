import { Router } from 'express'
import { searchController } from '~/controllers/search.controllers'
import { searchValidator } from '~/middlewares/search.middlewares'
import { paginationValidator } from '~/middlewares/tweets.middlewares'
import { accessTokenValidator, isUserLoggedInValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const searchRouter = Router()

/**
 *  Description: Search keywords
 *  Path: '/'
 *  Method: GET
 *  Query: { limit: number, page: number, content: string, media_type: string }
 */
searchRouter.get(
  '/',
  isUserLoggedInValidator(accessTokenValidator),
  isUserLoggedInValidator(verifiedUserValidator),
  paginationValidator,
  searchValidator,
  wrapRequestHandler(searchController)
)

export default searchRouter

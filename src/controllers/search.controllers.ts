import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { SearchMessages } from '~/constants/messages'
import { SearchQuery } from '~/models/requests/Search.requests'
import searchService from '~/services/search.services'

export const searchController = async (req: Request<ParamsDictionary, any, any, SearchQuery>, res: Response) => {
  const page = Number(req.query.page)
  const limit = Number(req.query.limit)

  const { tweets, tweetsCount } = await searchService.search({
    page,
    limit,
    content: req.query.content,
    user_id: req.decoded_authorization?.user_id,
    media_type: req.query.media_type,
    people_follow: JSON.parse(req.query.people_follow)
  })
  res.json({
    message: SearchMessages.SearchSuccess,
    result: {
      tweets,
      limit,
      page,
      total_pages: Math.ceil(tweetsCount / limit)
    }
  })
}

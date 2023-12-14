import { checkSchema } from 'express-validator'
import { MediaTypeQuery } from '~/constants/enums'
import { SearchMessages } from '~/constants/messages'
import { validate } from '~/utils/validation'

export const searchValidator = validate(
  checkSchema(
    {
      content: {
        isString: {
          errorMessage: SearchMessages.ContentMustBeString
        }
      },
      media_type: {
        optional: true,
        isIn: {
          options: [Object.values(MediaTypeQuery)]
        },
        errorMessage: SearchMessages.MediaTypeRequired
      },
      people_follow: {
        optional: true,
        isBoolean: {
          errorMessage: SearchMessages.PeopleFollowMustBeBoolean
        }
      }
    },
    ['query']
  )
)

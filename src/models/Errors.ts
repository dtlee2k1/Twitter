import { HttpStatusCode, UsersMessages } from '~/constants/enums'

type ErrorsType = Record<
  string,
  {
    msg: string
    [key: string]: any
  }
> // [key: any]: any

// Format lỗi trả về cho users

// Lỗi thường
export class ErrorWithStatus {
  message: string
  status: number

  constructor({ message, status }: { message: string; status: number }) {
    this.message = message
    this.status = status
  }
}

// Lỗi validation (422)
export class EntityError extends ErrorWithStatus {
  errors: ErrorsType

  constructor({ message = UsersMessages.ValidationError, errors }: { message?: string; errors: ErrorsType }) {
    super({ message, status: HttpStatusCode.UnprocessableEntity })
    this.message = message
    this.errors = errors
  }
}

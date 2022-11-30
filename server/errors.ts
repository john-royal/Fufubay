export class AppError extends Error {
  constructor (
    public readonly type: string,
    public readonly statusCode: number,
    public readonly message: string,
    public readonly underlyingError?: Error
  ) {
    super(type)
  }
}

export class BadRequestError extends AppError {
  constructor (message: string = 'Bad Request') {
    super('Bad Request', 400, message)
  }
}

export class UnauthorizedError extends AppError {
  constructor (message: string = 'Unauthorized') {
    super('Unauthorized', 401, message)
  }
}

export class ForbiddenError extends AppError {
  constructor (message: string = 'Forbidden') {
    super('Forbidden', 403, message)
  }
}

export class NotFoundError extends AppError {
  constructor (message: string = 'Not Found') {
    super('Not Found', 404, message)
  }
}

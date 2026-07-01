import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env'
import { UnauthorizedError } from '../shared/errors'

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; role: string }
    }
  }
}

const PUBLIC_ROUTES = ['/health']

export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const path = req.path.replace(/^\/api\/v1/, '')
  if (PUBLIC_ROUTES.includes(path)) {
    next()
    return
  }

  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next(new UnauthorizedError())
    return
  }

  const token = authHeader.split(' ')[1]
  if (!token) {
    next(new UnauthorizedError())
    return
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as { id: string; role: string }
    req.user = decoded
    next()
  } catch {
    next(new UnauthorizedError())
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken, type JWTPayload } from './jwt';

export type { JWTPayload };

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload;
}

/**
 * Middleware to authenticate requests
 * Returns user payload if authenticated, null otherwise
 */
export function authenticate(req: NextRequest): JWTPayload | null {
  const authHeader = req.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7); // Remove 'Bearer '
  const payload = verifyAccessToken(token);
  
  return payload;
}

/**
 * Create unauthorized response
 */
export function unauthorizedResponse(message = 'Unauthorized') {
  return NextResponse.json(
    { error: message },
    { status: 401 }
  );
}

/**
 * Create forbidden response
 */
export function forbiddenResponse(message = 'Forbidden') {
  return NextResponse.json(
    { error: message },
    { status: 403 }
  );
}

/**
 * Middleware wrapper for protected routes
 * Supports both regular routes and routes with dynamic params like [id]
 */
export function withAuth<T = any>(
  handler: (req: NextRequest, user: JWTPayload, context?: T) => Promise<NextResponse>
) {
  return async (req: NextRequest, context?: T) => {
    const user = authenticate(req);
    
    if (!user) {
      return unauthorizedResponse();
    }
    
    return handler(req, user, context);
  };
}

/**
 * Middleware wrapper for role-based access
 * Supports both regular routes and routes with dynamic params
 */
export function withRole<T = any>(
  roles: string[],
  handler: (req: NextRequest, user: JWTPayload, context?: T) => Promise<NextResponse>
) {
  return async (req: NextRequest, context?: T) => {
    const user = authenticate(req);
    
    if (!user) {
      return unauthorizedResponse();
    }
    
    if (!roles.includes(user.role)) {
      return forbiddenResponse('Insufficient permissions');
    }
    
    return handler(req, user, context);
  };
}

import { clerkClient } from '@clerk/clerk-sdk-node'
import type { Request } from 'express'

export interface AuthenticatedRequest extends Request {
  userId?: string
}

export async function verifyAuth(request: Request): Promise<{ userId: string } | null> {
  try {
    const authHeader = request.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.substring(7)
    
    // Verify the token with Clerk
    const session = await clerkClient.verifyToken(token)
    
    if (!session || !session.sub) {
      return null
    }

    return { userId: session.sub }
  } catch (error) {
    console.error('Auth verification error:', error)
    return null
  }
}

export function createErrorResponse(message: string, status: number = 400) {
  return new Response(
    JSON.stringify({ error: message }),
    {
      status,
      headers: { 'Content-Type': 'application/json' },
    }
  )
}

export function createSuccessResponse(data: any, status: number = 200) {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: { 'Content-Type': 'application/json' },
    }
  )
}


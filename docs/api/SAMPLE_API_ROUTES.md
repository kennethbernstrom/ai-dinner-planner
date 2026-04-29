# Sample API Routes Implementation

This guide provides example implementations for the family system API endpoints. These examples assume you're using a framework that supports API routes (like Next.js, Express, etc.) and Prisma for database access.

## Setup

First, ensure you have Prisma client set up. You'll need a prisma instance that's accessible from your API routes.

## Required API Endpoints

### 1. POST /api/families - Create Family

Creates a new family and adds the creator as an admin member.

```typescript
// api/families/route.ts or similar
import { auth } from '@clerk/nextjs';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, inviteCode } = body;

    // Validate input
    if (!name || name.length < 2 || name.length > 100) {
      return Response.json({ error: 'Invalid family name' }, { status: 400 });
    }

    if (!inviteCode || inviteCode.length !== 8) {
      return Response.json({ error: 'Invalid invite code' }, { status: 400 });
    }

    // Create family and add creator as admin in a transaction
    const family = await prisma.family.create({
      data: {
        name,
        inviteCode,
        createdBy: userId,
        members: {
          create: {
            clerkUserId: userId,
            role: 'admin',
            permissions: 'write',
          },
        },
      },
    });

    return Response.json(family);
  } catch (error) {
    console.error('Error creating family:', error);
    if (error.code === 'P2002') {
      return Response.json({ error: 'Invite code already in use' }, { status: 400 });
    }
    return Response.json({ error: 'Failed to create family' }, { status: 500 });
  }
}
```

### 2. POST /api/families/join - Join Family

Allows a user to join a family using an invite code.

```typescript
// api/families/join/route.ts
import { auth } from '@clerk/nextjs';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { inviteCode } = await req.json();

    if (!inviteCode || inviteCode.length !== 8) {
      return Response.json({ error: 'Invalid invite code' }, { status: 400 });
    }

    // Find family by invite code
    const family = await prisma.family.findUnique({
      where: { inviteCode },
    });

    if (!family) {
      return Response.json({ error: 'Family not found' }, { status: 404 });
    }

    // Check if user is already a member
    const existingMember = await prisma.familyMember.findUnique({
      where: {
        familyId_clerkUserId: {
          familyId: family.id,
          clerkUserId: userId,
        },
      },
    });

    if (existingMember) {
      return Response.json({ error: 'Already a member of this family' }, { status: 400 });
    }

    // Add user as member with read permissions
    const member = await prisma.familyMember.create({
      data: {
        familyId: family.id,
        clerkUserId: userId,
        role: 'member',
        permissions: 'read',
      },
    });

    return Response.json(member);
  } catch (error) {
    console.error('Error joining family:', error);
    return Response.json({ error: 'Failed to join family' }, { status: 500 });
  }
}
```

### 3. GET /api/families/current - Get Current User's Family

Returns the family that the current user belongs to.

```typescript
// api/families/current/route.ts
import { auth } from '@clerk/nextjs';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find user's family membership
    const membership = await prisma.familyMember.findFirst({
      where: { clerkUserId: userId },
      include: {
        family: true,
      },
    });

    if (!membership) {
      return Response.json({ error: 'No family found' }, { status: 404 });
    }

    return Response.json({
      family: membership.family,
      membership: {
        id: membership.id,
        familyId: membership.familyId,
        clerkUserId: membership.clerkUserId,
        role: membership.role,
        permissions: membership.permissions,
        joinedAt: membership.joinedAt,
      },
    });
  } catch (error) {
    console.error('Error getting current family:', error);
    return Response.json({ error: 'Failed to get family' }, { status: 500 });
  }
}
```

### 4. GET /api/families/[id] - Get Family Details

Returns family details with all members.

```typescript
// api/families/[id]/route.ts
import { auth } from '@clerk/nextjs';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const familyId = parseInt(params.id);
    if (isNaN(familyId)) {
      return Response.json({ error: 'Invalid family ID' }, { status: 400 });
    }

    // Verify user is a member of this family
    const membership = await prisma.familyMember.findUnique({
      where: {
        familyId_clerkUserId: {
          familyId,
          clerkUserId: userId,
        },
      },
    });

    if (!membership) {
      return Response.json({ error: 'Not a member of this family' }, { status: 403 });
    }

    // Get family with members
    const family = await prisma.family.findUnique({
      where: { id: familyId },
      include: {
        members: true,
      },
    });

    if (!family) {
      return Response.json({ error: 'Family not found' }, { status: 404 });
    }

    return Response.json(family);
  } catch (error) {
    console.error('Error getting family:', error);
    return Response.json({ error: 'Failed to get family' }, { status: 500 });
  }
}
```

### 5. GET /api/families/[id]/members - Get Family Members

Returns all members of a family.

```typescript
// api/families/[id]/members/route.ts
import { auth } from '@clerk/nextjs';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const familyId = parseInt(params.id);
    if (isNaN(familyId)) {
      return Response.json({ error: 'Invalid family ID' }, { status: 400 });
    }

    // Verify user is a member of this family
    const membership = await prisma.familyMember.findUnique({
      where: {
        familyId_clerkUserId: {
          familyId,
          clerkUserId: userId,
        },
      },
    });

    if (!membership) {
      return Response.json({ error: 'Not a member of this family' }, { status: 403 });
    }

    // Get all members
    const members = await prisma.familyMember.findMany({
      where: { familyId },
      orderBy: { joinedAt: 'asc' },
    });

    return Response.json(members);
  } catch (error) {
    console.error('Error getting family members:', error);
    return Response.json({ error: 'Failed to get members' }, { status: 500 });
  }
}
```

### 6. PATCH /api/families/[id]/members/[memberId] - Update Member

Updates a member's role or permissions. Only admins can do this.

```typescript
// api/families/[id]/members/[memberId]/route.ts
import { auth } from '@clerk/nextjs';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string; memberId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const familyId = parseInt(params.id);
    const memberId = parseInt(params.memberId);

    if (isNaN(familyId) || isNaN(memberId)) {
      return Response.json({ error: 'Invalid IDs' }, { status: 400 });
    }

    // Verify user is an admin of this family
    const userMembership = await prisma.familyMember.findUnique({
      where: {
        familyId_clerkUserId: {
          familyId,
          clerkUserId: userId,
        },
      },
    });

    if (!userMembership || userMembership.role !== 'admin') {
      return Response.json({ error: 'Not authorized' }, { status: 403 });
    }

    // Get update data
    const { permissions, role } = await req.json();
    const updateData: any = {};

    if (permissions && ['read', 'write'].includes(permissions)) {
      updateData.permissions = permissions;
    }

    if (role && ['admin', 'member'].includes(role)) {
      updateData.role = role;
    }

    if (Object.keys(updateData).length === 0) {
      return Response.json({ error: 'No valid updates provided' }, { status: 400 });
    }

    // Update member
    const updatedMember = await prisma.familyMember.update({
      where: {
        id: memberId,
        familyId, // Ensure member belongs to this family
      },
      data: updateData,
    });

    return Response.json(updatedMember);
  } catch (error) {
    console.error('Error updating member:', error);
    return Response.json({ error: 'Failed to update member' }, { status: 500 });
  }
}
```

### 7. DELETE /api/families/[id]/members/[memberId] - Remove Member

Removes a member from the family. Only admins can do this.

```typescript
// api/families/[id]/members/[memberId]/route.ts (add DELETE method)
export async function DELETE(
  req: Request,
  { params }: { params: { id: string; memberId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const familyId = parseInt(params.id);
    const memberId = parseInt(params.memberId);

    if (isNaN(familyId) || isNaN(memberId)) {
      return Response.json({ error: 'Invalid IDs' }, { status: 400 });
    }

    // Verify user is an admin of this family
    const userMembership = await prisma.familyMember.findUnique({
      where: {
        familyId_clerkUserId: {
          familyId,
          clerkUserId: userId,
        },
      },
    });

    if (!userMembership || userMembership.role !== 'admin') {
      return Response.json({ error: 'Not authorized' }, { status: 403 });
    }

    // Check if trying to remove themselves (last admin check)
    const memberToRemove = await prisma.familyMember.findUnique({
      where: { id: memberId },
    });

    if (memberToRemove?.clerkUserId === userId) {
      // Check if they're the last admin
      const adminCount = await prisma.familyMember.count({
        where: {
          familyId,
          role: 'admin',
        },
      });

      if (adminCount === 1) {
        return Response.json(
          { error: 'Cannot remove the last admin' },
          { status: 400 }
        );
      }
    }

    // Delete member
    await prisma.familyMember.delete({
      where: {
        id: memberId,
        familyId, // Ensure member belongs to this family
      },
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error removing member:', error);
    return Response.json({ error: 'Failed to remove member' }, { status: 500 });
  }
}
```

### 8. POST /api/families/[id]/leave - Leave Family

Allows a user to leave a family.

```typescript
// api/families/[id]/leave/route.ts
import { auth } from '@clerk/nextjs';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const familyId = parseInt(params.id);
    if (isNaN(familyId)) {
      return Response.json({ error: 'Invalid family ID' }, { status: 400 });
    }

    // Find user's membership
    const membership = await prisma.familyMember.findUnique({
      where: {
        familyId_clerkUserId: {
          familyId,
          clerkUserId: userId,
        },
      },
    });

    if (!membership) {
      return Response.json({ error: 'Not a member of this family' }, { status: 404 });
    }

    // If admin, check if they're the last admin
    if (membership.role === 'admin') {
      const adminCount = await prisma.familyMember.count({
        where: {
          familyId,
          role: 'admin',
        },
      });

      if (adminCount === 1) {
        return Response.json(
          { error: 'Cannot leave as the last admin. Please promote another member first.' },
          { status: 400 }
        );
      }
    }

    // Remove membership
    await prisma.familyMember.delete({
      where: { id: membership.id },
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error leaving family:', error);
    return Response.json({ error: 'Failed to leave family' }, { status: 500 });
  }
}
```

### 9. PATCH /api/families/[id] - Update Family

Updates family information (currently used for regenerating invite code).

```typescript
// api/families/[id]/route.ts (add PATCH method)
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const familyId = parseInt(params.id);
    if (isNaN(familyId)) {
      return Response.json({ error: 'Invalid family ID' }, { status: 400 });
    }

    // Verify user is an admin of this family
    const membership = await prisma.familyMember.findUnique({
      where: {
        familyId_clerkUserId: {
          familyId,
          clerkUserId: userId,
        },
      },
    });

    if (!membership || membership.role !== 'admin') {
      return Response.json({ error: 'Not authorized' }, { status: 403 });
    }

    const { inviteCode } = await req.json();

    if (inviteCode && inviteCode.length !== 8) {
      return Response.json({ error: 'Invalid invite code' }, { status: 400 });
    }

    // Update family
    const updatedFamily = await prisma.family.update({
      where: { id: familyId },
      data: {
        inviteCode,
        updatedAt: new Date(),
      },
    });

    return Response.json(updatedFamily);
  } catch (error) {
    console.error('Error updating family:', error);
    if (error.code === 'P2002') {
      return Response.json({ error: 'Invite code already in use' }, { status: 400 });
    }
    return Response.json({ error: 'Failed to update family' }, { status: 500 });
  }
}
```

## Adapting for Different Frameworks

### Express.js

For Express, the structure would be similar but with different syntax:

```typescript
// families.routes.ts
import { Router } from 'express';
import { requireAuth } from '@clerk/clerk-sdk-node';

const router = Router();

router.post('/', requireAuth(), async (req, res) => {
  try {
    const userId = req.auth.userId;
    // ... rest of logic
  } catch (error) {
    res.status(500).json({ error: 'Failed to create family' });
  }
});

export default router;
```

### Using Supabase Instead of Prisma

If you're using Supabase directly:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

// Example: Create family
const { data: family, error } = await supabase
  .from('families')
  .insert({
    name,
    invite_code: inviteCode,
    created_by: userId,
  })
  .select()
  .single();

if (error) throw error;

// Then create membership
await supabase
  .from('family_members')
  .insert({
    family_id: family.id,
    clerk_user_id: userId,
    role: 'admin',
    permissions: 'write',
  });
```

## Error Handling Best Practices

1. **Authentication**: Always verify user is authenticated
2. **Authorization**: Check user permissions for each operation
3. **Input Validation**: Validate all input data
4. **Database Errors**: Handle unique constraint violations gracefully
5. **Logging**: Log errors for debugging but don't expose internal details to clients
6. **Status Codes**: Use appropriate HTTP status codes
   - 200: Success
   - 400: Bad request (invalid input)
   - 401: Unauthorized (not authenticated)
   - 403: Forbidden (not authorized)
   - 404: Not found
   - 500: Internal server error

## Security Checklist

- [ ] All routes verify Clerk authentication
- [ ] Admin operations check for admin role
- [ ] Write operations check for write permissions
- [ ] Users can only access their own family's data
- [ ] Invite codes are validated (length, uniqueness)
- [ ] Cannot remove last admin from family
- [ ] Input is validated and sanitized
- [ ] Database queries use parameterized queries (Prisma handles this)
- [ ] Error messages don't leak sensitive information


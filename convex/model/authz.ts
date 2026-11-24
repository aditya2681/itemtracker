import type { QueryCtx, MutationCtx } from '../_generated/server';
import type { Id } from '../_generated/dataModel';
import { getAuthUserId } from '@convex-dev/auth/server';
import { components } from '../_generated/api';

export async function requireMember(ctx: QueryCtx | MutationCtx, workspaceId: Id<'workspaces'>, permission: 'read' | 'write' | 'owner' = 'read') {
  const identity = await getAuthUserId(ctx, components.auth);
  if (!identity) throw new Error('Please sign in to continue.');
  const member = await ctx.db.query('members').withIndex('by_workspace_and_identity', q => q.eq('workspaceId', workspaceId).eq('identity', identity)).unique();
  if (!member || !member.active) throw new Error('You do not have access to this workspace.');
  if (permission === 'owner' && member.role !== 'OWNER') throw new Error('Only the workspace owner can do this.');
  if (permission === 'write' && member.role === 'VIEWER') throw new Error('You do not have permission to make changes.');
  return { identity: identity, role: member.role };
}

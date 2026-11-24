import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { getAuthUserId } from '@convex-dev/auth/server';
import { components } from './_generated/api';
export const mine = query({ args: {}, returns: v.array(v.object({ workspaceId: v.id('workspaces'), name: v.string(), role: v.union(v.literal('OWNER'), v.literal('EDITOR'), v.literal('VIEWER')) })), handler: async ctx => {
  const identity = await getAuthUserId(ctx, components.auth);
  if (!identity) return [];
  const members = await ctx.db.query('members').withIndex('by_identity', q => q.eq('identity', identity)).take(50);
  const workspaces = await Promise.all(members.filter(member => member.active).map(async member => {
    const workspace = await ctx.db.get(member.workspaceId);
    return workspace ? { workspaceId: member.workspaceId, name: workspace.name, role: member.role } : null;
  }));
  return workspaces.filter(workspace => workspace !== null);
}});
export const create = mutation({ args: { name: v.string() }, returns: v.id('workspaces'), handler: async (ctx, { name }) => {
  const identity = await getAuthUserId(ctx, components.auth);
  if (!identity) throw new Error('Please sign in.');
  const existing = await ctx.db.query('members').withIndex('by_identity', q => q.eq('identity', identity)).take(1);
  if (existing.length) throw new Error('A workspace already exists for this account.');
  const clean = name.trim(); if (!clean || clean.length > 100) throw new Error('Enter a workspace name.');
  const workspaceId = await ctx.db.insert('workspaces', { name: clean, createdAt: Date.now() });
  await ctx.db.insert('members', { workspaceId, identity: identity, role: 'OWNER', active: true });
  return workspaceId;
}});

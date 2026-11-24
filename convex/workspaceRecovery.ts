import { internalMutation } from './_generated/server';
import { v } from 'convex/values';

// One-time repair: reject any unexpected membership or data before making changes.
export const repair = internalMutation({
  args: { userId: v.id('users'), main: v.id('workspaces'), duplicates: v.array(v.id('workspaces')), expectedMemberships: v.array(v.id('members')), expectedIdentities: v.array(v.string()) },
  returns: v.null(),
  handler: async (ctx, args) => {
    if (args.duplicates.includes(args.main) || new Set(args.duplicates).size !== args.duplicates.length) throw new Error('Invalid workspace list');
    const main = await ctx.db.get(args.main);
    if (!main || main.name !== 'Shop') throw new Error('Main workspace mismatch');
    if (!(await ctx.db.query('items').withIndex('by_workspace_and_name', q => q.eq('workspaceId', args.main)).first())) throw new Error('Main workspace has no items');
    const memberships = await Promise.all(args.expectedMemberships.map(id => ctx.db.get(id)));
    if (args.expectedIdentities.length !== args.expectedMemberships.length || memberships.some((m, i) => !m || m.identity !== args.expectedIdentities[i] || m.role !== 'OWNER' || !m.active)) throw new Error('Membership changed');
    const mainMembers = await ctx.db.query('members').filter(q => q.eq(q.field('workspaceId'), args.main)).collect();
    if (mainMembers.length !== 1 || !args.expectedMemberships.includes(mainMembers[0]._id)) throw new Error('Unexpected main members');
    for (const id of args.duplicates) {
      if (!(await ctx.db.get(id))) throw new Error('Duplicate missing');
      const members = await ctx.db.query('members').filter(q => q.eq(q.field('workspaceId'), id)).collect();
      if (members.length !== 1 || !args.expectedMemberships.includes(members[0]._id)) throw new Error('Unexpected duplicate members');
      for (const table of ['submissions','migrationMappings','legacyObservations','categories','items','distributors','itemDistributors','bills','billLines','priceRecords','revisions','audit','attachments'] as const) {
        const row = await ctx.db.query(table).filter(q => q.eq(q.field('workspaceId'), id)).first();
        if (row) throw new Error(`Workspace is not empty: ${table}`);
      }
    }
    if (memberships.length !== args.duplicates.length + 1) throw new Error('Unexpected membership count');
    await ctx.db.patch(mainMembers[0]._id, { identity: args.userId });
    for (const id of args.duplicates) {
      const member = memberships.find(m => m?.workspaceId === id);
      if (!member) throw new Error('Missing member');
      await ctx.db.delete(member._id);
      await ctx.db.delete(id);
    }
    return null;
  },
});

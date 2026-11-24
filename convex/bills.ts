import { mutation } from './_generated/server';
import { v } from 'convex/values';
import { requireMember } from './model/authz';

export const softDelete = mutation({
  args: { workspaceId: v.id('workspaces'), billId: v.id('bills'), expectedVersion: v.number() },
  returns: v.null(),
  handler: async (ctx, { workspaceId, billId, expectedVersion }) => {
    const actor = await requireMember(ctx, workspaceId, 'owner');
    const bill = await ctx.db.get('bills', billId);
    if (!bill || bill.workspaceId !== workspaceId) throw new Error('Bill not found.');
    if (bill.status === 'DELETED') return null;
    if (bill.version !== expectedVersion) throw new Error('This bill changed. Refresh it before deleting.');
    const records = await ctx.db.query('priceRecords').withIndex('by_workspace_and_bill', q => q.eq('workspaceId', workspaceId).eq('sourceBillId', billId)).take(101);
    if (records.length > 100) throw new Error('This bill has too many lines for this operation.');
    const now = Date.now();
    await ctx.db.patch('bills', billId, { status: 'DELETED', deletedAt: now, updatedAt: now, version: bill.version + 1 });
    for (const record of records) {
      await ctx.db.patch('priceRecords', record._id, { sourceStatus: 'DELETED', updatedAt: now });
    }
    await ctx.db.insert('audit', { workspaceId, actor: actor.identity, action: 'DELETE_BILL_RETAIN_PRICES', entity: billId, at: now });
    return null;
  },
});

import { query } from './_generated/server';
import schema from './schema';
export const listRecent = query({ args: { workspaceId: v.id('workspaces') }, returns: v.array(schema.doc('bills')), handler: async (ctx, {workspaceId}) => {
 await requireMember(ctx, workspaceId);
 return await ctx.db.query('bills').withIndex('by_workspace_and_status_and_date', q => q.eq('workspaceId', workspaceId).eq('status', 'ACTIVE')).order('desc').take(100);
}});

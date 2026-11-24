import { query } from './_generated/server';
import { v } from 'convex/values';
import { requireMember } from './model/authz';
import schema from './schema';

export const recentForItem = query({
  args: { workspaceId: v.id('workspaces'), itemId: v.id('items') },
  returns: v.object({ purchases: v.array(schema.doc('priceRecords')), enquiries: v.array(schema.doc('priceRecords')) }),
  handler: async (ctx, { workspaceId, itemId }) => {
    await requireMember(ctx, workspaceId);
    const item = await ctx.db.get('items', itemId);
    if (!item || item.workspaceId !== workspaceId) throw new Error('Item not found.');
    const lookup = (kind: 'PURCHASE' | 'ENQUIRY') => ctx.db.query('priceRecords').withIndex('by_workspace_and_item_and_kind_and_status_and_date', q => q.eq('workspaceId', workspaceId).eq('itemId', itemId).eq('kind', kind).eq('status', 'ACTIVE')).order('desc').take(3);
    const [purchases, enquiries] = await Promise.all([lookup('PURCHASE'), lookup('ENQUIRY')]);
    return { purchases, enquiries };
  },
});

import { paginationOptsValidator, paginationResultValidator } from 'convex/server';
export const search = query({
 args: { workspaceId: v.id('workspaces'), itemId: v.optional(v.id('items')), distributorId: v.optional(v.id('distributors')), kind: v.optional(v.union(v.literal('PURCHASE'), v.literal('ENQUIRY'))), from: v.optional(v.string()), to: v.optional(v.string()), paginationOpts: paginationOptsValidator },
 returns: paginationResultValidator(schema.doc('priceRecords')),
 handler: async (ctx, a) => {
  await requireMember(ctx, a.workspaceId);
  if (a.from && !/^\d{4}-\d{2}-\d{2}$/.test(a.from)) throw new Error('Invalid start date.');
  if (a.to && !/^\d{4}-\d{2}-\d{2}$/.test(a.to)) throw new Error('Invalid end date.');
  if (a.from && a.to && a.from > a.to) throw new Error('Start date must be before end date.');
  const base = ctx.db.query('priceRecords').withIndex('by_workspace_and_status_and_date', q => {
   const range = q.eq('workspaceId', a.workspaceId).eq('status', 'ACTIVE');
   if (a.from && a.to) return range.gte('eventDate', a.from).lte('eventDate', a.to);
   if (a.from) return range.gte('eventDate', a.from);
   if (a.to) return range.lte('eventDate', a.to);
   return range;
  }).order('desc');
  if (!a.itemId && !a.distributorId && !a.kind) return await base.paginate(a.paginationOpts);
  return await base.filter(q => q.and(...[
   ...(a.itemId ? [q.eq(q.field('itemId'), a.itemId)] : []),
   ...(a.distributorId ? [q.eq(q.field('distributorId'), a.distributorId)] : []),
   ...(a.kind ? [q.eq(q.field('kind'), a.kind)] : []),
  ])).paginate(a.paginationOpts);
 },
});

import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import schema from './schema';
import { requireMember } from './model/authz';
const id = v.id('workspaces');
export const list = query({ args: { workspaceId: id }, returns: v.object({ items: v.array(schema.doc('items')), distributors: v.array(schema.doc('distributors')) }), handler: async (ctx, { workspaceId }) => {
 await requireMember(ctx, workspaceId);
 const [items, distributors] = await Promise.all([ctx.db.query('items').withIndex('by_workspace_and_name', q => q.eq('workspaceId', workspaceId)).take(2000), ctx.db.query('distributors').withIndex('by_workspace_and_name', q => q.eq('workspaceId', workspaceId)).take(2000)]);
 return { items, distributors };
}});
export const addItem = mutation({ args: { workspaceId:id, name:v.string(), baseUnit:v.string(), packageType:v.string(), packageContent:v.string(), aliases:v.array(v.string()) }, returns:v.id('items'), handler:async(ctx,a)=>{
 await requireMember(ctx,a.workspaceId,'write'); const name=a.name.trim(); const n=Number(a.packageContent);
 if(!name || name.length>100 || !Number.isFinite(n) || n<=0 || !a.baseUnit.trim() || !a.packageType.trim() || a.aliases.length>20) throw new Error('Enter a name, unit, package and positive package content.');
 const normalizedName=name.toLowerCase(); const found=await ctx.db.query('items').withIndex('by_workspace_and_name',q=>q.eq('workspaceId',a.workspaceId).eq('normalizedName',normalizedName)).first(); if(found) throw new Error('An item with this name already exists.');
 const now=Date.now(); return await ctx.db.insert('items',{...a,name,normalizedName,active:true,createdAt:now,updatedAt:now});
}});
export const addDistributor = mutation({ args: { workspaceId:id, name:v.string(), phone:v.string() }, returns:v.id('distributors'), handler:async(ctx,a)=>{
 await requireMember(ctx,a.workspaceId,'write'); const name=a.name.trim(); if(!name || name.length>100) throw new Error('Enter a distributor name.'); const normalizedName=name.toLowerCase();
 const found=await ctx.db.query('distributors').withIndex('by_workspace_and_name',q=>q.eq('workspaceId',a.workspaceId).eq('normalizedName',normalizedName)).first(); if(found) throw new Error('A distributor with this name already exists.');
 const now=Date.now(); return await ctx.db.insert('distributors',{...a,name,normalizedName,active:true,createdAt:now,updatedAt:now});
}});

export const updateItem = mutation({
 args: { workspaceId: id, itemId: v.id('items'), expectedUpdatedAt: v.number(), name: v.string(), baseUnit: v.string(), packageType: v.string(), packageContent: v.string() },
 returns: v.null(),
 handler: async (ctx, a) => {
  const actor = await requireMember(ctx, a.workspaceId, 'write');
  const item = await ctx.db.get('items', a.itemId);
  if (!item || item.workspaceId !== a.workspaceId) throw new Error('Item not found.');
  if (item.updatedAt !== a.expectedUpdatedAt) throw new Error('This item was changed elsewhere. Reopen it and try again.');
  const name = a.name.trim(), baseUnit = a.baseUnit.trim().toUpperCase(), packageType = a.packageType.trim().toUpperCase(), content = Number(a.packageContent);
  if (!name || name.length > 100 || !baseUnit || baseUnit.length > 40 || baseUnit.startsWith('UNKNOWN') || !packageType || packageType.length > 40 || !Number.isFinite(content) || content <= 0) throw new Error('Enter a name, base unit, package and positive default content.');
  const now = Date.now();
  await ctx.db.patch('items', a.itemId, { name, normalizedName: name.toLowerCase(), baseUnit, packageType, packageContent: a.packageContent, updatedAt: now });
  await ctx.db.insert('audit', { workspaceId: a.workspaceId, actor: actor.identity, action: 'UPDATE_ITEM_DEFAULTS', entity: a.itemId, at: now });
  return null;
 },
});

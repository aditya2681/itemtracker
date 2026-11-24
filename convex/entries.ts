import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import schema from './schema';
import { requireMember } from './model/authz';
import { calculatePrice } from '../src/domain/pricing';
const mode=v.union(v.literal('PER_PACKAGE'),v.literal('PER_BASE_UNIT'),v.literal('LINE_TOTAL'));
const line=v.object({itemId:v.id('items'),itemVersion:v.optional(v.number()),packageType:v.string(),packageContent:v.string(),packageCount:v.string(),mode,price:v.string(),discount:v.string()});
export const create = mutation({ args:{workspaceId:v.id('workspaces'), distributorId:v.id('distributors'), eventDate:v.string(), billNumber:v.string(), submissionKey:v.string(), kind:v.union(v.literal('PURCHASE'),v.literal('ENQUIRY')), lines:v.array(line)}, returns:v.null(), handler:async(ctx,a)=>{
 const actor=await requireMember(ctx,a.workspaceId,'write');
 if(!a.submissionKey || a.submissionKey.length>100) throw new Error('Invalid submission key.');
 const previous=await ctx.db.query('submissions').withIndex('by_workspace_and_key',q=>q.eq('workspaceId',a.workspaceId).eq('key',a.submissionKey)).unique(); if(previous) return null; const distributor=await ctx.db.get('distributors',a.distributorId);
 if(!distributor || distributor.workspaceId!==a.workspaceId || !distributor.active) throw new Error('Select an active distributor.');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(a.eventDate) || a.lines.length<1 || a.lines.length>100) throw new Error('Enter a date and between 1 and 100 lines.');
 const prepared=await Promise.all(a.lines.map(async l=>{const item=await ctx.db.get('items',l.itemId); if(!item || item.workspaceId!==a.workspaceId || !item.active) throw new Error('Select an active item.'); if(l.itemVersion !== undefined && item.updatedAt !== l.itemVersion) throw new Error('An item’s defaults changed. Remove and add that item again before saving.'); if (item.baseUnit.startsWith('UNKNOWN')) throw new Error('Set this item’s package contents and base unit before recording a price.'); return {line:l,item,calc:calculatePrice(l)};}));
 let totalPaise=0; for(const p of prepared){ totalPaise+=p.calc.netPaise; if(!Number.isSafeInteger(totalPaise)) throw new Error('Total is too large.'); }
 const now=Date.now(); const billId=a.kind==='PURCHASE'?await ctx.db.insert('bills',{workspaceId:a.workspaceId,distributorId:a.distributorId,billDate:a.eventDate,billNumber:a.billNumber.trim(),notes:'',status:'ACTIVE',totalPaise,version:1,createdAt:now,updatedAt:now,createdBy:actor.identity}):undefined;
 for(const p of prepared){const l=p.line; const lineId=billId?await ctx.db.insert('billLines',{workspaceId:a.workspaceId,billId,lineKey:crypto.randomUUID(),itemId:l.itemId,packageType:l.packageType,packageContent:l.packageContent,packageCount:l.packageCount,mode:l.mode,price:l.price,discount:l.discount,quantity:p.calc.quantity,netPaise:p.calc.netPaise,unitRate:p.calc.unitRate,status:'ACTIVE'}):undefined;
 const recordId=await ctx.db.insert('priceRecords',{workspaceId:a.workspaceId,kind:a.kind,itemId:l.itemId,distributorId:a.distributorId,itemName:p.item.name,distributorName:distributor.name,eventDate:a.eventDate,baseUnit:p.item.baseUnit,packageType:l.packageType,packageContent:l.packageContent,packageCount:l.packageCount,mode:l.mode,price:l.price,quantity:p.calc.quantity,netPaise:p.calc.netPaise,unitRate:p.calc.unitRate,sourceBillId:billId,sourceLineId:lineId,sourceStatus:billId?'ACTIVE':'NONE',status:'ACTIVE',version:1,createdAt:now,updatedAt:now,createdBy:actor.identity});
 await ctx.db.insert('revisions',{workspaceId:a.workspaceId,priceRecordId:recordId,action:'CREATE',actor:actor.identity,at:now}); }
 await ctx.db.insert('submissions',{workspaceId:a.workspaceId,key:a.submissionKey});
 await ctx.db.insert('audit',{workspaceId:a.workspaceId,actor:actor.identity,action:'CREATE_'+a.kind,entity:billId??'enquiry',at:now}); return null;
}});
export const recent = query({args:{workspaceId:v.id('workspaces')},returns:v.object({bills:v.array(schema.doc('bills')), rates:v.array(schema.doc('priceRecords'))}),handler:async(ctx,{workspaceId})=>{await requireMember(ctx,workspaceId);const [bills,rates]=await Promise.all([ctx.db.query('bills').withIndex('by_workspace_and_status_and_date',q=>q.eq('workspaceId',workspaceId).eq('status','ACTIVE')).order('desc').take(100),ctx.db.query('priceRecords').withIndex('by_workspace_and_status_and_date',q=>q.eq('workspaceId',workspaceId).eq('status','ACTIVE')).order('desc').take(3000)]);return {bills,rates};}});

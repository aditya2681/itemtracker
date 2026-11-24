#!/usr/bin/env python3
import argparse,collections,json,subprocess,zipfile,decimal
p=argparse.ArgumentParser();p.add_argument('--snapshot',required=True);p.add_argument('--deployment',required=True);p.add_argument('--workspace',required=True);a=p.parse_args()
with zipfile.ZipFile(a.snapshot) as z:
 def read(t):return [json.loads(x) for x in z.read(t+'/documents.jsonl').splitlines() if x]
 source={t:read(t) for t in ('products','distributors','productDistributors','billItems','enquiryPriceHistory','bills')}
query='const w=ctx.db.normalizeId("workspaces",'+json.dumps(a.workspace)+');const m=await ctx.db.query("migrationMappings").withIndex("by_workspace_and_source",q=>q.eq("workspaceId",w).eq("sourceDeployment","elated-cassowary-248")).take(4000);const r=await ctx.db.query("priceRecords").withIndex("by_workspace_and_status_and_date",q=>q.eq("workspaceId",w).eq("status","ACTIVE")).take(4000);const b=await ctx.db.query("bills").withIndex("by_workspace_and_status_and_date",q=>q.eq("workspaceId",w).eq("status","ACTIVE")).take(1);return {m,r,b};'
p1=subprocess.run(['npx','convex','run','--deployment',a.deployment,'--inline-query',query],capture_output=True,text=True,check=True);dst=json.loads(p1.stdout);maps={(x['sourceTable'],x['sourceId']):x for x in dst['m']};rates={x['_id']:x for x in dst['r']};bills={x['_id']:x for x in source['bills']};errors=collections.Counter();checked=collections.Counter()
for table in ('products','distributors','productDistributors','billItems','enquiryPriceHistory'):
 for row in source[table]:
  m=maps.get((table,row['_id']))
  if not m:errors[table+'_missing_mapping']+=1;continue
  checked[table]+=1
  if table not in ('billItems','enquiryPriceHistory'):continue
  record=rates.get(m['targetId'])
  if not record:errors[table+'_missing_price']+=1;continue
  bill=bills.get(row.get('billId'));date=bill['billDate'] if bill else row['enquiryDate'];supplier=bill['distributorId'] if bill else row['distributorId'];item=maps.get(('products',row['productId']));dist=maps.get(('distributors',supplier))
  if not item or record['itemId']!=item['targetId'] or not dist or record['distributorId']!=dist['targetId']:errors[table+'_relationship']+=1
  if record['eventDate']!=date:errors[table+'_date']+=1
  if record['kind']!=('PURCHASE' if bill else 'ENQUIRY'):errors[table+'_kind']+=1
  if bill and (record.get('sourceBillId') or record['sourceStatus']!='LEGACY'):errors[table+'_bill_reference']+=1
  weight=decimal.Decimal(str(row['weightPerUnitKg']));price=decimal.Decimal(str(row['ratePerUnit'] if bill else row['quotedRatePerUnit']));expected=price/(weight if weight>0 else 1)
  if abs(decimal.Decimal(record['unitRate'])-expected)>decimal.Decimal('.00000001'):errors[table+'_rate']+=1
  if weight<=0 and record['baseUnit']!='QUOTED UNIT (WEIGHT UNKNOWN)':errors[table+'_unknown_weight']+=1
print(json.dumps({'checked':dict(checked),'errors':dict(errors),'active_bills_in_workspace':len(dst['b'])},indent=2));raise SystemExit(1 if errors else 0)

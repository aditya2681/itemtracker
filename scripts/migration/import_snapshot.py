#!/usr/bin/env python3
"""Import specific stock-tracker tables through the internal idempotent mutation."""
import argparse, json, subprocess, sys, zipfile

TABLES=('products','distributors','productDistributors','billItems','enquiryPriceHistory')
def main():
 p=argparse.ArgumentParser();p.add_argument('--snapshot',required=True);p.add_argument('--deployment',required=True,choices=['aromatic-emu-434','benevolent-mosquito-853']);p.add_argument('--workspace',required=True);p.add_argument('--batch-id',required=True);a=p.parse_args()
 with zipfile.ZipFile(a.snapshot) as z:
  def read(name):return [json.loads(x) for x in z.read(name+'/documents.jsonl').splitlines() if x.strip()]
  bills={r['_id']:r for r in read('bills')}
  for table in TABLES:
   rows=read(table)
   if table=='billItems':
    for row in rows:
     if row['billId'] not in bills:raise ValueError('Missing bill reference')
     row['legacyBill']=bills[row['billId']]
   count=skipped=0
   for start in range(0,len(rows),50):
    batch=rows[start:start+50]
    args={'workspaceId':a.workspace,'batchId':a.batch_id,'table':table,'rows':[json.dumps(x,separators=(',',':'),ensure_ascii=False) for x in batch]}
    result=subprocess.run(['npx','convex','run','--deployment',a.deployment,'migration:importBatch',json.dumps(args,ensure_ascii=False,separators=(',',':'))],text=True,capture_output=True)
    if result.returncode:print(f'{table} batch {start} failed: {result.stderr}',file=sys.stderr);sys.exit(1)
    value=json.loads(result.stdout);count+=value['inserted'];skipped+=value['skipped']
   print(f'{table}: inserted={count}, skipped={skipped}',flush=True)
if __name__=='__main__':main()

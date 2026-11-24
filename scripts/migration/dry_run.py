#!/usr/bin/env python3
"""Read-only inventory and reconciliation of an explicitly supplied Convex export."""
import argparse, collections, datetime, json, zipfile
from decimal import Decimal, InvalidOperation

TABLES = ('products', 'distributors', 'productDistributors', 'bills', 'billItems', 'purchasePriceHistory', 'enquiryPriceHistory')
def main():
    parser=argparse.ArgumentParser(); parser.add_argument('snapshot'); args=parser.parse_args()
    with zipfile.ZipFile(args.snapshot) as archive:
        data={table:[json.loads(line) for line in archive.read(table+'/documents.jsonl').splitlines() if line.strip()] for table in TABLES}
    products={x['_id']:x for x in data['products']}; suppliers={x['_id']:x for x in data['distributors']}; bills={x['_id']:x for x in data['bills']}
    report={'source_counts':{table:len(rows) for table,rows in data.items()},'warnings':collections.Counter(),'purchase_multiset':{},'date_errors':{},'unresolved_references':{}}
    for t in ('billItems','purchasePriceHistory','enquiryPriceHistory','productDistributors'):
        report['unresolved_references'][t]={'product':sum(r.get('productId') not in products for r in data[t]),'distributor':sum(r.get('distributorId') not in suppliers for r in data[t] if 'distributorId' in r),'bill':sum(r.get('billId') not in bills for r in data[t] if 'billId' in r)}
    key=lambda r:(r['billId'],r['productId'],str(r['unitsBought']),str(r['ratePerUnit']),str(r['totalPrice']))
    left=collections.Counter(map(key,data['billItems']));right=collections.Counter(map(key,data['purchasePriceHistory']))
    report['purchase_multiset']={'matched':sum((left&right).values()),'bill_only':sum((left-right).values()),'history_only':sum((right-left).values())}
    for table,field in [('bills','billDate'),('purchasePriceHistory','purchaseDate'),('enquiryPriceHistory','enquiryDate')]:
        count=0
        for row in data[table]:
            try: datetime.date.fromisoformat(row[field])
            except (ValueError,KeyError,TypeError): count+=1
        report['date_errors'][table]=count
    for row in data['purchasePriceHistory']:
        bill=bills.get(row['billId'])
        if bill and bill['distributorId'] != row['distributorId']: report['warnings']['purchase_supplier_mismatch']+=1
        if bill and bill['billDate'] != row['purchaseDate']: report['warnings']['purchase_date_mismatch']+=1
    for table in ('products','distributors'):
        names=collections.Counter(str(r.get('name','')).strip().casefold() for r in data[table]); report['warnings'][table+'_duplicate_normalized_names']=sum(c-1 for c in names.values() if c>1)
    for row in data['billItems']:
        try:
            n=Decimal(str(row['unitsBought'])); weight=Decimal(str(row['weightPerUnitKg'])); rate=Decimal(str(row['ratePerUnit'])); total=Decimal(str(row['totalPrice'])); perkg=Decimal(str(row['ratePerKg']))
            if not all(x.is_finite() for x in (n,weight,rate,total,perkg)) or min(n,weight,rate,total)<=0: report['warnings']['purchase_nonpositive_or_invalid']+=1;continue
            if abs(n*rate-total)>Decimal('.01'): report['warnings']['purchase_total_mismatch']+=1
            if abs(rate/weight-perkg)>Decimal('.02'): report['warnings']['purchase_rate_mismatch']+=1
        except (KeyError,InvalidOperation,ValueError,ZeroDivisionError): report['warnings']['purchase_nonpositive_or_invalid']+=1
    for row in data['enquiryPriceHistory']:
        try:
            weight=Decimal(str(row['weightPerUnitKg']));rate=Decimal(str(row['quotedRatePerUnit']))
            if not weight.is_finite() or not rate.is_finite() or rate<=0: report['warnings']['enquiry_invalid_rate']+=1
            elif weight<=0: report['warnings']['enquiry_missing_weight']+=1
            elif row.get('quotedRatePerKg') is None: report['warnings']['enquiry_missing_calculated_rate']+=1
            elif abs(rate/weight-Decimal(str(row['quotedRatePerKg'])))>Decimal('.02'): report['warnings']['enquiry_rate_mismatch']+=1
        except (KeyError,InvalidOperation,ValueError,ZeroDivisionError): report['warnings']['enquiry_invalid_rate']+=1
    report['warnings']=dict(report['warnings']);print(json.dumps(report,indent=2,sort_keys=True))
if __name__=='__main__': main()

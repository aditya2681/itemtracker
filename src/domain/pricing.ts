import Decimal from 'decimal.js';

export type PriceMode = 'PER_PACKAGE' | 'PER_BASE_UNIT' | 'LINE_TOTAL';
export interface PriceInput { packageCount: string; packageContent: string; price: string; discount: string; mode: PriceMode }

/** Calculates with decimal arithmetic; totals round once to paise (half up). */
export function calculatePrice(input: PriceInput) {
  let count: Decimal, content: Decimal, price: Decimal, discount: Decimal;
  try {
    count = new Decimal(input.packageCount); content = new Decimal(input.packageContent);
    price = new Decimal(input.price); discount = new Decimal(input.discount || '0');
  } catch { throw new Error('Enter valid quantities and amounts'); }
  if (![count, content, price, discount].every(x => x.isFinite()) || count.lte(0) || content.lte(0) || price.lte(0) || discount.lt(0)) throw new Error('Quantities and price must be positive; discount cannot be negative');
  const quantity = count.mul(content);
  const gross = input.mode === 'PER_PACKAGE' ? count.mul(price) : input.mode === 'PER_BASE_UNIT' ? quantity.mul(price) : price;
  if (discount.gte(gross)) throw new Error('Discount must be less than the line amount');
  const grossPaise = gross.mul(100).toDecimalPlaces(0, Decimal.ROUND_HALF_UP);
  const netPaise = gross.minus(discount).mul(100).toDecimalPlaces(0, Decimal.ROUND_HALF_UP);
  if (netPaise.lte(0)) throw new Error('Line amount must round to at least one paise');
  if (grossPaise.abs().gt(Number.MAX_SAFE_INTEGER) || netPaise.abs().gt(Number.MAX_SAFE_INTEGER)) throw new Error('Amount is too large');
  return { quantity: quantity.toString(), grossPaise: grossPaise.toNumber(), netPaise: netPaise.toNumber(), unitRate: netPaise.div(100).div(quantity).toDecimalPlaces(8, Decimal.ROUND_HALF_UP).toString() };
}

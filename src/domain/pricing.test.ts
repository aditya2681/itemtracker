import { describe, expect, it } from 'vitest';
import { calculatePrice, type PriceInput } from './pricing';
const calc = (patch: Partial<PriceInput> = {}) => calculatePrice({packageCount:'4', packageContent:'50', price:'1000', discount:'0', mode:'PER_PACKAGE', ...patch});
describe('pricing', () => {
  it('calculates a package price', () => expect(calc()).toMatchObject({quantity:'200',netPaise:400000,unitRate:'20'}));
  it('calculates pieces', () => expect(calc({packageCount:'3',packageContent:'15',price:'300'})).toMatchObject({quantity:'45',netPaise:90000,unitRate:'20'}));
  it('distinguishes line total', () => expect(calc({mode:'LINE_TOTAL'}).unitRate).toBe('5'));
  it('calculates base-unit price', () => expect(calc({packageCount:'2',packageContent:'25',price:'20',mode:'PER_BASE_UNIT'}).netPaise).toBe(100000));
  it('applies discount before unit rate', () => expect(calc({discount:'100'})).toMatchObject({netPaise:390000,unitRate:'19.5'}));
  it('rounds only at the monetary boundary', () => expect(calc({packageCount:'1',packageContent:'3',price:'1.005'}).netPaise).toBe(101));
  it.each([{packageCount:'0'}, {packageContent:'0'}, {price:'-1'}, {discount:'4000'}, {price:'NaN'}])('rejects invalid values', p => expect(() => calc(p)).toThrow());
});

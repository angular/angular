import { docRegionDefault } from './operators.1';

describe('squareOdd - operators.1.ts', () => {
  it('should return square odds', () => {
    const spy = spyOn(console, 'log');
    docRegionDefault(console);
    expect(spy).toHaveBeenCalledTimes(3);
    expect(spy.calls.allArgs()).toEqual([
      [1],
      [9],
      [25],
    ]);
  });
});

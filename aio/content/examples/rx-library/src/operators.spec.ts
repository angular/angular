import { docRegionDefault } from './operators';

describe('squaredNums - operators.ts', () => {
  it('should return square odds', () => {
    const spy = spyOn(console, 'log');
    docRegionDefault(console);
    expect(spy).toHaveBeenCalledTimes(3);
    expect(spy.calls.allArgs()).toEqual([
      [1],
      [4],
      [9],
    ]);
  });
});

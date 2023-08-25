import { docRegionDefault, docRegionCustomOperator } from './operators';

describe('squaredNums - operators.ts', () => {
  it('default example should return square odds', () => {
    const consoleSpy = jasmine.createSpyObj<Console>('console', ['log']);
    docRegionDefault(consoleSpy);
    expect(consoleSpy.log).toHaveBeenCalledTimes(3);
    expect(consoleSpy.log.calls.allArgs()).toEqual([
      [1], [4], [9],
    ]);
  });

  it('custom operator example should return square odds twice', () => {
    const consoleSpy = jasmine.createSpyObj<Console>('console', ['log']);
    docRegionCustomOperator(consoleSpy);
    expect(consoleSpy.log).toHaveBeenCalledTimes(6);
    expect(consoleSpy.log.calls.allArgs()).toEqual([
      [1], [4], [9],
      [1], [4], [9],
    ]);
  });
});

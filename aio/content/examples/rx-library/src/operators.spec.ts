import { docRegionDefault } from './operators';

describe('squaredNums - operators.ts', () => {
  it('should return square odds', () => {
    const consoleSpy = jasmine.createSpyObj<Console>('console', ['log']);
    docRegionDefault(consoleSpy);
    expect(consoleSpy.log).toHaveBeenCalledTimes(3);
    expect(consoleSpy.log.calls.allArgs()).toEqual([
      [1],
      [4],
      [9],
    ]);
  });
});

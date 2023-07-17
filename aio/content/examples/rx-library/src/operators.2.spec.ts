import { docRegionDefault } from './operators.2';

describe('squareOdd - operators.2.ts', () => {
  it('should return square odds', () => {
    const consoleSpy = jasmine.createSpyObj<Console>('console', ['log']);
    docRegionDefault(consoleSpy);
    expect(consoleSpy.log).toHaveBeenCalledTimes(3);
    expect(consoleSpy.log.calls.allArgs()).toEqual([
      [1],
      [9],
      [25],
    ]);
  });
});

import { docRegionDefault } from './operators.1';

describe('squareOdd - operators.1.ts', () => {
  it('should return square odds', () => {
    const console = {log: jasmine.createSpy('log')};
    docRegionDefault(console);
    expect(console.log).toHaveBeenCalledTimes(3);
    expect(console.log.calls.allArgs()).toEqual([
      [1],
      [9],
      [25],
    ]);
  });
});

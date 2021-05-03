import { docRegionDefault } from './operators';

describe('squaredNums - operators.ts', () => {
  it('should return square odds', () => {
    const console = {log: jasmine.createSpy('log')};
    docRegionDefault(console);
    expect(console.log).toHaveBeenCalledTimes(3);
    expect(console.log.calls.allArgs()).toEqual([
      [1],
      [4],
      [9],
    ]);
  });
});

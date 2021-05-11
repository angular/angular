import { docRegionObserver } from './subscribing';

describe('subscribing', () => {
  it('should subscribe and emit', () => {
    const consoleSpy = jasmine.createSpyObj<Console>('console', ['log']);
    docRegionObserver(consoleSpy);
    expect(consoleSpy.log).toHaveBeenCalledTimes(8);
    expect(consoleSpy.log.calls.allArgs()).toEqual([
      ['Observer got a next value: 1'],
      ['Observer got a next value: 2'],
      ['Observer got a next value: 3'],
      ['Observer got a complete notification'],
      ['Observer got a next value: 1'],
      ['Observer got a next value: 2'],
      ['Observer got a next value: 3'],
      ['Observer got a complete notification'],
    ]);
  });
});

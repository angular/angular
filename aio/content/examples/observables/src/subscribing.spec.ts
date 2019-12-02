import { docRegionObserver } from './subscribing';

describe('subscribing', () => {
  it('should subscribe and emit', () => {
    const console = {log: jasmine.createSpy('log')};
    docRegionObserver(console);
    expect(console.log).toHaveBeenCalledTimes(8);
    expect(console.log.calls.allArgs()).toEqual([
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

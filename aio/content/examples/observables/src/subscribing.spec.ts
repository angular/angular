import { docRegionObserver } from './subscribing';

describe('subscribing', () => {
  it('should subscribe and emit', () => {
    const spy = spyOn(console, 'log');
    docRegionObserver(console);
    expect(spy).toHaveBeenCalledTimes(8);
    expect(spy.calls.allArgs()).toEqual([
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

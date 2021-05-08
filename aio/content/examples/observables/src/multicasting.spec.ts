import { docRegionDelaySequence, docRegionMulticastSequence } from './multicasting';

describe('multicasting', () => {
  beforeEach(() => {
    jasmine.clock().install();
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  it('should create an observable and emit in sequence', () => {
    const spy = spyOn(console, 'log');
    docRegionDelaySequence(console);
    jasmine.clock().tick(10000);
    expect(spy).toHaveBeenCalledTimes(12);
    expect(spy.calls.allArgs()).toEqual([
      [1],
      ['1st subscribe: 1'],
      ['2nd subscribe: 1'],
      [2],
      ['1st subscribe: 2'],
      ['2nd subscribe: 2'],
      [3],
      ['Finished sequence'],
      ['1st subscribe: 3'],
      ['1st sequence finished.'],
      ['2nd subscribe: 3'],
      ['2nd sequence finished.']
    ]);
  });

  it('should create an observable and multicast the emissions', () => {
    const spy = spyOn(console, 'log');
    docRegionMulticastSequence(console);
    jasmine.clock().tick(10000);
    expect(spy).toHaveBeenCalledTimes(7);
    expect(spy.calls.allArgs()).toEqual([
      ['1st subscribe: 1'],
      ['1st subscribe: 2'],
      ['2nd subscribe: 2'],
      ['1st subscribe: 3'],
      ['2nd subscribe: 3'],
      ['1st sequence finished.'],
      ['2nd sequence finished.']
    ]);
  });
});

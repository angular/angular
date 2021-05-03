import { docRegionDelaySequence, docRegionMulticastSequence } from './multicasting';

describe('multicasting', () => {
  let console;
  beforeEach(() => {
    jasmine.clock().install();
    console = {log: jasmine.createSpy('log')};
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  it('should create an observable and emit in sequence', () => {
    docRegionDelaySequence(console);
    jasmine.clock().tick(10000);
    expect(console.log).toHaveBeenCalledTimes(12);
    expect(console.log.calls.allArgs()).toEqual([
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
    docRegionMulticastSequence(console);
    jasmine.clock().tick(10000);
    expect(console.log).toHaveBeenCalledTimes(7);
    expect(console.log.calls.allArgs()).toEqual([
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

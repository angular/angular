import { docRegionDelaySequence, docRegionMulticastSequence } from './multicasting';

describe('multicasting', () => {
  beforeEach(() => {
    jasmine.clock().install();
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  it('should create an observable and emit in sequence', () => {
    const consoleSpy = jasmine.createSpyObj<Console>('console', ['log']);
    docRegionDelaySequence(consoleSpy);
    jasmine.clock().tick(10000);
    expect(consoleSpy.log).toHaveBeenCalledTimes(12);
    expect(consoleSpy.log.calls.allArgs()).toEqual([
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
    const consoleSpy = jasmine.createSpyObj<Console>('console', ['log']);
    docRegionMulticastSequence(consoleSpy);
    jasmine.clock().tick(10000);
    expect(consoleSpy.log).toHaveBeenCalledTimes(7);
    expect(consoleSpy.log.calls.allArgs()).toEqual([
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

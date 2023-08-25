import { docRegionSubscriber } from './creating';

describe('observables', () => {
  it('should create an observable using the constructor', () => {
    const consoleSpy = jasmine.createSpyObj<Console>('console', ['log']);
    docRegionSubscriber(consoleSpy);
    expect(consoleSpy.log).toHaveBeenCalledTimes(4);
    expect(consoleSpy.log.calls.allArgs()).toEqual([
      [1],
      [2],
      [3],
      ['Finished sequence'],
    ]);
  });
});

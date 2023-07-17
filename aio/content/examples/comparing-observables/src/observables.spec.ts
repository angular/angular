import { docRegionChain, docRegionObservable, docRegionUnsubscribe } from './observables';

describe('observables', () => {
  it('should print 2', (doneFn: DoneFn) => {
    const consoleSpy = jasmine.createSpyObj<Console>('console', ['log']);
    const observable = docRegionObservable(consoleSpy);
    observable.subscribe(() => {
      expect(consoleSpy.log).toHaveBeenCalledTimes(1);
      expect(consoleSpy.log).toHaveBeenCalledWith(2);
      doneFn();
    });
  });

  it('should close the subscription', () => {
    const subscription = docRegionUnsubscribe();
    expect(subscription.closed).toBeTruthy();
  });

  it('should chain an observable', (doneFn: DoneFn) => {
    const observable = docRegionChain();
    observable.subscribe(value => {
      expect(value).toBe(4);
      doneFn();
    });
  });
});

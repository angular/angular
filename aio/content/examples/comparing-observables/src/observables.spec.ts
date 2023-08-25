import { docRegionOperators, docRegionObservable, docRegionError, docRegionUnsubscribe } from './observables';

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

  it('should transform an observable with operators', (doneFn: DoneFn) => {
    const results = [] as (number | string)[];
    const observable = docRegionOperators();
    observable.subscribe({
      next: value => results.push(value),
      complete: () => {
        expect(results).toEqual([0, 2, 4, 'Ta Da!']);
        doneFn();
      }
    });
  });

  it('should handle errors', (doneFn: DoneFn) => {
    const consoleSpy = jasmine.createSpyObj<Console>('console', ['error']);
    docRegionError(consoleSpy);
    expect(consoleSpy.error).toHaveBeenCalledTimes(1);
    expect(consoleSpy.error).toHaveBeenCalledWith(new Error('revised error'));
    doneFn();
  });
});

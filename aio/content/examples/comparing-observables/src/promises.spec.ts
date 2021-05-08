import { docRegionError, docRegionPromise } from './promises';

describe('promises', () => {
  it('should print 2', (doneFn: DoneFn) => {
    const consoleSpy = jasmine.createSpyObj<Console>('console', ['log']);
    const pr = docRegionPromise(consoleSpy, 2);
    pr.then((value) => {
      expect(consoleSpy.log).toHaveBeenCalledTimes(1);
      expect(consoleSpy.log).toHaveBeenCalledWith(2);
      expect(value).toBe(4);
      doneFn();
    });
  });

  it('should throw an error', (doneFn: DoneFn) => {
    const promise = docRegionError();
    promise
      .then(() => {
        throw new Error('Promise should be rejected.');
      },
        () => doneFn());
  });
});

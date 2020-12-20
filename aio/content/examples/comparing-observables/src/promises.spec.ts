import { docRegionError, docRegionPromise } from './promises';

describe('promises', () => {
  it('should print 2', (doneFn: DoneFn) => {
    const consoleLogSpy = spyOn(console, 'log');
    const pr = docRegionPromise(console, 2);
    pr.then((value) => {
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      expect(consoleLogSpy).toHaveBeenCalledWith(2);
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

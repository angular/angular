import { docRegionError, docRegionPromise } from './promises';

describe('promises', () => {
  it('should print -4', (doneFn: DoneFn) => {
    const consoleSpy = jasmine.createSpyObj<Console>('console', ['log']);
    const pr = docRegionPromise(consoleSpy, 2);
    pr.then((value) => {
      expect(consoleSpy.log).toHaveBeenCalledTimes(1);
      expect(consoleSpy.log).toHaveBeenCalledWith(2);
      expect(value).toBe(-4);
      doneFn();
    });
  });

  it('should throw an error', (doneFn: DoneFn) => {
    const consoleSpy = jasmine.createSpyObj<Console>('console', ['error']);
    const pr = docRegionError(consoleSpy);
    pr.then(
      (value) => {
        doneFn.fail(`should not have succeeded with ${value}`);
      },
      (err) => {
        expect(consoleSpy.error).toHaveBeenCalledTimes(1);
        expect(consoleSpy.error).toHaveBeenCalledWith('Error: revised error');
        expect(err.toString()).toEqual('Error: revised error');
        doneFn();
      });
  });
});

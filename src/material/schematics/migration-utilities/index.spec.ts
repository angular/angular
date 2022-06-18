import {writeUpdates} from './index';

describe('migration-utilities', () => {
  describe('writeUpdates', () => {
    it('should call update functions in the correct order', () => {
      const fn1 = jasmine.createSpy().and.returnValue('1');
      const fn2 = jasmine.createSpy().and.returnValue('2');
      const fn3 = jasmine.createSpy().and.returnValue('3');

      const result = writeUpdates('0', [
        {offset: 1, updateFn: fn3},
        {offset: 2, updateFn: fn2},
        {offset: 3, updateFn: fn1},
      ]);

      expect(fn1).toHaveBeenCalledOnceWith('0');
      expect(fn2).toHaveBeenCalledOnceWith('1');
      expect(fn3).toHaveBeenCalledOnceWith('2');
      expect(result).toBe('3');
    });
  });
});

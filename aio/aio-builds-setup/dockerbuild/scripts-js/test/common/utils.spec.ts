// Imports
import {assertNotMissingOrEmpty, getEnvVar} from '../../lib/common/utils';

// Tests
describe('utils', () => {

  describe('assertNotMissingOrEmpty()', () => {

    it('should throw if passed an empty value', () => {
      expect(() => assertNotMissingOrEmpty('foo', undefined)).
        toThrowError('Missing or empty required parameter \'foo\'!');
      expect(() => assertNotMissingOrEmpty('bar', null)).toThrowError('Missing or empty required parameter \'bar\'!');
      expect(() => assertNotMissingOrEmpty('baz', '')).toThrowError('Missing or empty required parameter \'baz\'!');
    });


    it('should not throw if passed a non-empty value', () => {
      expect(() => assertNotMissingOrEmpty('foo', ' ')).not.toThrow();
      expect(() => assertNotMissingOrEmpty('bar', 'bar')).not.toThrow();
      expect(() => assertNotMissingOrEmpty('baz', 'b a z')).not.toThrow();
    });

  });


  describe('getEnvVar()', () => {
    const emptyVar = '$$test_utils_getEnvVar_empty$$';
    const nonEmptyVar = '$$test_utils_getEnvVar_nonEmpty$$';
    const undefinedVar = '$$test_utils_getEnvVar_undefined$$';

    beforeEach(() => {
      process.env[emptyVar] = '';
      process.env[nonEmptyVar] = 'foo';
    });
    afterEach(() => {
      delete process.env[emptyVar];
      delete process.env[nonEmptyVar];
    });


    it('should return an environment variable', () => {
      expect(getEnvVar(nonEmptyVar)).toBe('foo');
    });


    it('should exit with an error if the environment variable is not defined', () => {
      const consoleErrorSpy = spyOn(console, 'error');
      const processExitSpy = spyOn(process, 'exit');

      getEnvVar(undefinedVar);

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(consoleErrorSpy.calls.argsFor(0)[0]).toContain(undefinedVar);
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });


    it('should exit with an error if the environment variable is empty', () => {
      const consoleErrorSpy = spyOn(console, 'error');
      const processExitSpy = spyOn(process, 'exit');

      getEnvVar(emptyVar);

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(consoleErrorSpy.calls.argsFor(0)[0]).toContain(emptyVar);
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });


    it('should return an empty string if an undefined variable is optional', () => {
      expect(getEnvVar(undefinedVar, true)).toBe('');
    });


    it('should return an empty string if an empty variable is optional', () => {
      expect(getEnvVar(emptyVar, true)).toBe('');
    });

  });

});

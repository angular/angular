// Imports
import {resolve as resolvePath} from 'path';
import {
  assert,
  assertNotMissingOrEmpty,
  computeArtifactDownloadPath,
  computeShortSha,
  getEnvVar,
  getPrInfoFromDownloadPath,
  Logger,
} from '../../lib/common/utils';

// Tests
describe('utils', () => {

  describe('computeShortSha', () => {
    it('should return only the first SHORT_SHA_LEN characters of the SHA', () => {
      expect(computeShortSha('0123456789')).toEqual('0123456');
      expect(computeShortSha('ABC')).toEqual('ABC');
      expect(computeShortSha('')).toEqual('');
    });
  });


  describe('assert', () => {
    it('should throw if passed a false value', () => {
      expect(() => assert(false, 'error message')).toThrowError('error message');
    });

    it('should not throw if passed a true value', () => {
      expect(() => assert(true, 'error message')).not.toThrow();
    });
  });


  describe('computeArtifactDownloadPath', () => {
    it('should compute an absolute path based on the artifact info provided', () => {
      const downloadDir = '/a/b/c';
      const pr = 123;
      const sha = 'ABCDEF1234567';
      const artifactPath = 'a/path/to/file.zip';
      const path = computeArtifactDownloadPath(downloadDir, pr, sha, artifactPath);
      expect(path).toBe(resolvePath('/a/b/c/123-ABCDEF1-file.zip'));
    });
  });


  describe('getPrInfoFromDownloadPath', () => {
    it('should extract the PR and SHA from the file path', () => {
      const {pr, sha} = getPrInfoFromDownloadPath('a/b/c/12345-ABCDE-artifact.zip');
      expect(pr).toEqual(12345);
      expect(sha).toEqual('ABCDE');
    });
  });


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


  describe('Logger', () => {
    let consoleErrorSpy: jasmine.Spy;
    let consoleInfoSpy: jasmine.Spy;
    let consoleLogSpy: jasmine.Spy;
    let consoleWarnSpy: jasmine.Spy;
    let logger: Logger;

    beforeEach(() => {
      consoleErrorSpy = spyOn(console, 'error');
      consoleInfoSpy = spyOn(console, 'info');
      consoleLogSpy = spyOn(console, 'log');
      consoleWarnSpy = spyOn(console, 'warn');

      logger = new Logger('TestScope');
    });


    it('should delegate to `console`', () => {
      logger.error('foo');
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy.calls.argsFor(0)).toContain('foo');

      logger.info('bar');
      expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
      expect(consoleInfoSpy.calls.argsFor(0)).toContain('bar');

      logger.log('baz');
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      expect(consoleLogSpy.calls.argsFor(0)).toContain('baz');

      logger.warn('qux');
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      expect(consoleWarnSpy.calls.argsFor(0)).toContain('qux');
    });


    it('should prepend messages with the current date and logger\'s scope', () => {
      const mockDate = new Date(1337);
      const expectedDateStr = `[${mockDate}]`;
      const expectedScopeStr = 'TestScope:           ';

      jasmine.clock().mockDate(mockDate);
      jasmine.clock().withMock(() => {
        logger.error();
        logger.info();
        logger.log();
        logger.warn();
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(expectedDateStr, expectedScopeStr);
      expect(consoleInfoSpy).toHaveBeenCalledWith(expectedDateStr, expectedScopeStr);
      expect(consoleLogSpy).toHaveBeenCalledWith(expectedDateStr, expectedScopeStr);
      expect(consoleWarnSpy).toHaveBeenCalledWith(expectedDateStr, expectedScopeStr);
    });


    it('should pass all arguments to `console`', () => {
      const someString = jasmine.any(String);

      logger.error('foo1', 'foo2');
      expect(consoleErrorSpy).toHaveBeenCalledWith(someString, someString, 'foo1', 'foo2');

      logger.info('bar1', 'bar2');
      expect(consoleInfoSpy).toHaveBeenCalledWith(someString, someString, 'bar1', 'bar2');

      logger.log('baz1', 'baz2');
      expect(consoleLogSpy).toHaveBeenCalledWith(someString, someString, 'baz1', 'baz2');

      logger.warn('qux1', 'qux2');
      expect(consoleWarnSpy).toHaveBeenCalledWith(someString, someString, 'qux1', 'qux2');
    });

  });

});

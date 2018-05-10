// Imports
import {
  assert,
  assertNotMissingOrEmpty,
  computeArtifactDownloadPath,
  computeShortSha,
  getEnvVar,
  getPrInfoFromDownloadPath,
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
      expect(path).toEqual('/a/b/c/123-ABCDEF1-file.zip');
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

});

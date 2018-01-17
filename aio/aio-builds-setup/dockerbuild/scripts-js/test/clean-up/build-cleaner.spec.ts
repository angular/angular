// Imports
import * as fs from 'fs';
import * as path from 'path';
import * as shell from 'shelljs';
import {BuildCleaner} from '../../lib/clean-up/build-cleaner';
import {HIDDEN_DIR_PREFIX} from '../../lib/common/constants';
import {GithubPullRequests} from '../../lib/common/github-pull-requests';

// Tests
describe('BuildCleaner', () => {
  let cleaner: BuildCleaner;

  beforeEach(() => cleaner = new BuildCleaner('/foo/bar', 'baz/qux', '12345'));


  describe('constructor()', () => {

    it('should throw if \'buildsDir\' is empty', () => {
      expect(() => new BuildCleaner('', '/baz/qux', '12345')).
        toThrowError('Missing or empty required parameter \'buildsDir\'!');
    });


    it('should throw if \'repoSlug\' is empty', () => {
      expect(() => new BuildCleaner('/foo/bar', '', '12345')).
        toThrowError('Missing or empty required parameter \'repoSlug\'!');
    });


    it('should throw if \'githubToken\' is empty', () => {
      expect(() => new BuildCleaner('/foo/bar', 'baz/qux', '')).
        toThrowError('Missing or empty required parameter \'githubToken\'!');
    });

  });


  describe('cleanUp()', () => {
    let cleanerGetExistingBuildNumbersSpy: jasmine.Spy;
    let cleanerGetOpenPrNumbersSpy: jasmine.Spy;
    let cleanerRemoveUnnecessaryBuildsSpy: jasmine.Spy;
    let existingBuildsDeferred: {resolve: (v?: any) => void, reject: (e?: any) => void};
    let openPrsDeferred: {resolve: (v?: any) => void, reject: (e?: any) => void};
    let promise: Promise<void>;

    beforeEach(() => {
      cleanerGetExistingBuildNumbersSpy = spyOn(cleaner as any, 'getExistingBuildNumbers').and.callFake(() => {
        return new Promise((resolve, reject) => existingBuildsDeferred = {resolve, reject});
      });
      cleanerGetOpenPrNumbersSpy = spyOn(cleaner as any, 'getOpenPrNumbers').and.callFake(() => {
        return new Promise((resolve, reject) => openPrsDeferred = {resolve, reject});
      });
      cleanerRemoveUnnecessaryBuildsSpy = spyOn(cleaner as any, 'removeUnnecessaryBuilds');

      promise = cleaner.cleanUp();
    });


    it('should return a promise', () => {
      expect(promise).toEqual(jasmine.any(Promise));
    });


    it('should get the existing builds', () => {
      expect(cleanerGetExistingBuildNumbersSpy).toHaveBeenCalled();
    });


    it('should get the open PRs', () => {
      expect(cleanerGetOpenPrNumbersSpy).toHaveBeenCalled();
    });


    it('should reject if \'getExistingBuildNumbers()\' rejects', done => {
      promise.catch(err => {
        expect(err).toBe('Test');
        done();
      });

      existingBuildsDeferred.reject('Test');
    });


    it('should reject if \'getOpenPrNumbers()\' rejects', done => {
      promise.catch(err => {
        expect(err).toBe('Test');
        done();
      });

      openPrsDeferred.reject('Test');
    });


    it('should reject if \'removeUnnecessaryBuilds()\' rejects', done => {
      promise.catch(err => {
        expect(err).toBe('Test');
        done();
      });

      cleanerRemoveUnnecessaryBuildsSpy.and.returnValue(Promise.reject('Test'));
      existingBuildsDeferred.resolve();
      openPrsDeferred.resolve();
    });


    it('should pass existing builds and open PRs to \'removeUnnecessaryBuilds()\'', done => {
      promise.then(() => {
        expect(cleanerRemoveUnnecessaryBuildsSpy).toHaveBeenCalledWith('foo', 'bar');
        done();
      });

      existingBuildsDeferred.resolve('foo');
      openPrsDeferred.resolve('bar');
    });


    it('should resolve with the value returned by \'removeUnnecessaryBuilds()\'', done => {
      promise.then(result => {
        expect(result as any).toBe('Test');
        done();
      });

      cleanerRemoveUnnecessaryBuildsSpy.and.returnValue(Promise.resolve('Test'));
      existingBuildsDeferred.resolve();
      openPrsDeferred.resolve();
    });

  });


  // Protected methods

  describe('getExistingBuildNumbers()', () => {
    let fsReaddirSpy: jasmine.Spy;
    let readdirCb: (err: any, files?: string[]) => void;
    let promise: Promise<number[]>;

    beforeEach(() => {
      fsReaddirSpy = spyOn(fs, 'readdir').and.callFake((_: string, cb: typeof readdirCb) => readdirCb = cb);
      promise = (cleaner as any).getExistingBuildNumbers();
    });


    it('should return a promise', () => {
      expect(promise).toEqual(jasmine.any(Promise));
    });


    it('should get the contents of the builds directory', () => {
      expect(fsReaddirSpy).toHaveBeenCalled();
      expect(fsReaddirSpy.calls.argsFor(0)[0]).toBe('/foo/bar');
    });


    it('should reject if an error occurs while getting the files', done => {
      promise.catch(err => {
        expect(err).toBe('Test');
        done();
      });

      readdirCb('Test');
    });


    it('should resolve with the returned files (as numbers)', done => {
      promise.then(result => {
        expect(result).toEqual([12, 34, 56]);
        done();
      });

      readdirCb(null, ['12', '34', '56']);
    });


    it('should remove `HIDDEN_DIR_PREFIX` from the filenames', done => {
      promise.then(result => {
        expect(result).toEqual([12, 34, 56]);
        done();
      });

      readdirCb(null, [`${HIDDEN_DIR_PREFIX}12`, '34', `${HIDDEN_DIR_PREFIX}56`]);
    });


    it('should ignore files with non-numeric (or zero) names', done => {
      promise.then(result => {
        expect(result).toEqual([12, 34, 56]);
        done();
      });

      readdirCb(null, ['12', 'foo', '34', 'bar', '56', '000']);
    });

  });


  describe('getOpenPrNumbers()', () => {
    let prDeferred: {resolve: (v: any) => void, reject: (v: any) => void};
    let promise: Promise<number[]>;

    beforeEach(() => {
      spyOn(GithubPullRequests.prototype, 'fetchAll').and.callFake(() => {
        return new Promise((resolve, reject) => prDeferred = {resolve, reject});
      });

      promise = (cleaner as any).getOpenPrNumbers();
    });


    it('should return a promise', () => {
      expect(promise).toEqual(jasmine.any(Promise));
    });


    it('should fetch open PRs via \'GithubPullRequests\'', () => {
      expect(GithubPullRequests.prototype.fetchAll).toHaveBeenCalledWith('open');
    });


    it('should reject if an error occurs while fetching PRs', done => {
      promise.catch(err => {
        expect(err).toBe('Test');
        done();
      });

      prDeferred.reject('Test');
    });


    it('should resolve with the numbers of the fetched PRs', done => {
      promise.then(prNumbers => {
        expect(prNumbers).toEqual([1, 2, 3]);
        done();
      });

      prDeferred.resolve([{id: 0, number: 1}, {id: 1, number: 2}, {id: 2, number: 3}]);
    });

  });


  describe('removeDir()', () => {
    let shellChmodSpy: jasmine.Spy;
    let shellRmSpy: jasmine.Spy;
    let shellTestSpy: jasmine.Spy;

    beforeEach(() => {
      shellChmodSpy = spyOn(shell, 'chmod');
      shellRmSpy = spyOn(shell, 'rm');
      shellTestSpy = spyOn(shell, 'test').and.returnValue(true);
    });


    it('should test if the directory exists (and return if is does not)', () => {
      shellTestSpy.and.returnValue(false);
      (cleaner as any).removeDir('/foo/bar');

      expect(shellTestSpy).toHaveBeenCalledWith('-d', '/foo/bar');
      expect(shellChmodSpy).not.toHaveBeenCalled();
      expect(shellRmSpy).not.toHaveBeenCalled();
    });


    it('should remove the specified directory and its content', () => {
      (cleaner as any).removeDir('/foo/bar');
      expect(shellRmSpy).toHaveBeenCalledWith('-rf', '/foo/bar');
    });


    it('should make the directory and its content writable before removing', () => {
      shellRmSpy.and.callFake(() => expect(shellChmodSpy).toHaveBeenCalledWith('-R', 'a+w', '/foo/bar'));
      (cleaner as any).removeDir('/foo/bar');

      expect(shellRmSpy).toHaveBeenCalled();
    });


    it('should catch errors and log them', () => {
      const consoleErrorSpy = spyOn(console, 'error');
      shellRmSpy.and.callFake(() => {
        // tslint:disable-next-line: no-string-throw
        throw 'Test';
      });

      (cleaner as any).removeDir('/foo/bar');

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(consoleErrorSpy.calls.argsFor(0)[0]).toContain('Unable to remove \'/foo/bar\'');
      expect(consoleErrorSpy.calls.argsFor(0)[1]).toBe('Test');
    });

  });


  describe('removeUnnecessaryBuilds()', () => {
    let consoleLogSpy: jasmine.Spy;
    let cleanerRemoveDirSpy: jasmine.Spy;

    beforeEach(() => {
      consoleLogSpy = spyOn(console, 'log');
      cleanerRemoveDirSpy = spyOn(cleaner as any, 'removeDir');
    });


    it('should log the number of existing builds, open PRs and builds to be removed', () => {
      (cleaner as any).removeUnnecessaryBuilds([1, 2, 3], [3, 4, 5, 6]);

      expect(console.log).toHaveBeenCalledWith('Existing builds: 3');
      expect(console.log).toHaveBeenCalledWith('Open pull requests: 4');
      expect(console.log).toHaveBeenCalledWith('Removing 2 build(s): 1, 2');
    });


    it('should construct full paths to directories (by prepending \'buildsDir\')', () => {
      (cleaner as any).removeUnnecessaryBuilds([1, 2, 3], []);

      expect(cleanerRemoveDirSpy).toHaveBeenCalledWith(path.normalize('/foo/bar/1'));
      expect(cleanerRemoveDirSpy).toHaveBeenCalledWith(path.normalize('/foo/bar/2'));
      expect(cleanerRemoveDirSpy).toHaveBeenCalledWith(path.normalize('/foo/bar/3'));
    });


    it('should try removing hidden directories as well', () => {
      (cleaner as any).removeUnnecessaryBuilds([1, 2, 3], []);

      expect(cleanerRemoveDirSpy).toHaveBeenCalledWith(path.normalize(`/foo/bar/${HIDDEN_DIR_PREFIX}1`));
      expect(cleanerRemoveDirSpy).toHaveBeenCalledWith(path.normalize(`/foo/bar/${HIDDEN_DIR_PREFIX}2`));
      expect(cleanerRemoveDirSpy).toHaveBeenCalledWith(path.normalize(`/foo/bar/${HIDDEN_DIR_PREFIX}3`));
    });


    it('should remove the builds that do not correspond to open PRs', () => {
      (cleaner as any).removeUnnecessaryBuilds([1, 2, 3, 4], [2, 4]);
      expect(cleanerRemoveDirSpy).toHaveBeenCalledTimes(4);
      expect(cleanerRemoveDirSpy).toHaveBeenCalledWith(path.normalize('/foo/bar/1'));
      expect(cleanerRemoveDirSpy).toHaveBeenCalledWith(path.normalize('/foo/bar/3'));
      expect(cleanerRemoveDirSpy).toHaveBeenCalledWith(path.normalize(`/foo/bar/${HIDDEN_DIR_PREFIX}1`));
      expect(cleanerRemoveDirSpy).toHaveBeenCalledWith(path.normalize(`/foo/bar/${HIDDEN_DIR_PREFIX}3`));
      cleanerRemoveDirSpy.calls.reset();

      (cleaner as any).removeUnnecessaryBuilds([1, 2, 3, 4], [1, 2, 3, 4]);
      expect(cleanerRemoveDirSpy).toHaveBeenCalledTimes(0);
      cleanerRemoveDirSpy.calls.reset();

      (cleaner as any).removeUnnecessaryBuilds([1, 2, 3, 4], []);
      expect(cleanerRemoveDirSpy).toHaveBeenCalledTimes(8);
      expect(cleanerRemoveDirSpy).toHaveBeenCalledWith(path.normalize('/foo/bar/1'));
      expect(cleanerRemoveDirSpy).toHaveBeenCalledWith(path.normalize('/foo/bar/2'));
      expect(cleanerRemoveDirSpy).toHaveBeenCalledWith(path.normalize('/foo/bar/3'));
      expect(cleanerRemoveDirSpy).toHaveBeenCalledWith(path.normalize('/foo/bar/4'));
      expect(cleanerRemoveDirSpy).toHaveBeenCalledWith(path.normalize(`/foo/bar/${HIDDEN_DIR_PREFIX}1`));
      expect(cleanerRemoveDirSpy).toHaveBeenCalledWith(path.normalize(`/foo/bar/${HIDDEN_DIR_PREFIX}2`));
      expect(cleanerRemoveDirSpy).toHaveBeenCalledWith(path.normalize(`/foo/bar/${HIDDEN_DIR_PREFIX}3`));
      expect(cleanerRemoveDirSpy).toHaveBeenCalledWith(path.normalize(`/foo/bar/${HIDDEN_DIR_PREFIX}4`));
      cleanerRemoveDirSpy.calls.reset();
    });

  });

});

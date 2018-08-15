// Imports
import * as fs from 'fs';
import {normalize} from 'path';
import * as shell from 'shelljs';
import {BuildCleaner} from '../../lib/clean-up/build-cleaner';
import {HIDDEN_DIR_PREFIX} from '../../lib/common/constants';
import {GithubPullRequests} from '../../lib/common/github-pull-requests';
import {Logger} from '../../lib/common/utils';

const EXISTING_BUILDS = [10, 20, 30, 40];
const EXISTING_DOWNLOADS = [
  '10-ABCDEF0-build.zip',
  '10-1234567-build.zip',
  '20-ABCDEF0-build.zip',
  '20-1234567-build.zip',
];
const OPEN_PRS = [10, 40];

// Tests
describe('BuildCleaner', () => {
  let loggerErrorSpy: jasmine.Spy;
  let loggerLogSpy: jasmine.Spy;
  let cleaner: BuildCleaner;

  beforeEach(() => {
    loggerErrorSpy = spyOn(Logger.prototype, 'error');
    loggerLogSpy = spyOn(Logger.prototype, 'log');
    cleaner = new BuildCleaner('/foo/bar', 'baz', 'qux', '12345', '/downloads', 'build.zip');
  });

  describe('constructor()', () => {

    it('should throw if \'buildsDir\' is empty', () => {
      expect(() => new BuildCleaner('', 'baz', 'qux', '12345', 'downloads', 'build.zip')).
        toThrowError('Missing or empty required parameter \'buildsDir\'!');
    });


    it('should throw if \'githubOrg\' is empty', () => {
      expect(() => new BuildCleaner('/foo/bar', '', 'qux', '12345', 'downloads', 'build.zip')).
        toThrowError('Missing or empty required parameter \'githubOrg\'!');
    });


    it('should throw if \'githubRepo\' is empty', () => {
      expect(() => new BuildCleaner('/foo/bar', 'baz', '', '12345', 'downloads', 'build.zip')).
        toThrowError('Missing or empty required parameter \'githubRepo\'!');
    });


    it('should throw if \'githubToken\' is empty', () => {
      expect(() => new BuildCleaner('/foo/bar', 'baz', 'qux', '', 'downloads', 'build.zip')).
        toThrowError('Missing or empty required parameter \'githubToken\'!');
    });


    it('should throw if \'downloadsDir\' is empty', () => {
      expect(() => new BuildCleaner('/foo/bar', 'baz', 'qux', '12345', '', 'build.zip')).
        toThrowError('Missing or empty required parameter \'downloadsDir\'!');
    });


    it('should throw if \'artifactPath\' is empty', () => {
      expect(() => new BuildCleaner('/foo/bar', 'baz', 'qux', '12345', 'downloads', '')).
        toThrowError('Missing or empty required parameter \'artifactPath\'!');
    });

  });


  describe('cleanUp()', () => {
    let cleanerGetExistingBuildNumbersSpy: jasmine.Spy;
    let cleanerGetOpenPrNumbersSpy: jasmine.Spy;
    let cleanerGetExistingDownloadsSpy: jasmine.Spy;
    let cleanerRemoveUnnecessaryBuildsSpy: jasmine.Spy;
    let cleanerRemoveUnnecessaryDownloadsSpy: jasmine.Spy;

    beforeEach(() => {
      cleanerGetExistingBuildNumbersSpy = spyOn(cleaner, 'getExistingBuildNumbers').and.resolveTo(EXISTING_BUILDS);
      cleanerGetOpenPrNumbersSpy = spyOn(cleaner, 'getOpenPrNumbers').and.resolveTo(OPEN_PRS);
      cleanerGetExistingDownloadsSpy = spyOn(cleaner, 'getExistingDownloads').and.resolveTo(EXISTING_DOWNLOADS);

      cleanerRemoveUnnecessaryBuildsSpy = spyOn(cleaner, 'removeUnnecessaryBuilds');
      cleanerRemoveUnnecessaryDownloadsSpy = spyOn(cleaner, 'removeUnnecessaryDownloads');
    });


    it('should return a promise', async () => {
      const promise = cleaner.cleanUp();
      expect(promise).toBeInstanceOf(Promise);

      // Do not complete the test and release the spies synchronously, to avoid running the actual implementations.
      await promise;
    });


    it('should get the open PRs', async () => {
      await cleaner.cleanUp();
      expect(cleanerGetOpenPrNumbersSpy).toHaveBeenCalled();
    });


    it('should get the existing builds', async () => {
      await cleaner.cleanUp();
      expect(cleanerGetExistingBuildNumbersSpy).toHaveBeenCalled();
    });


    it('should get the existing downloads', async () => {
      await cleaner.cleanUp();
      expect(cleanerGetExistingDownloadsSpy).toHaveBeenCalled();
    });


    it('should pass existing builds and open PRs to \'removeUnnecessaryBuilds()\'', async () => {
      await cleaner.cleanUp();
      expect(cleanerRemoveUnnecessaryBuildsSpy).toHaveBeenCalledWith(EXISTING_BUILDS, OPEN_PRS);
    });


    it('should pass existing downloads and open PRs to \'removeUnnecessaryDownloads()\'', async () => {
      await cleaner.cleanUp();
      expect(cleanerRemoveUnnecessaryDownloadsSpy).toHaveBeenCalledWith(EXISTING_DOWNLOADS, OPEN_PRS);
    });


    it('should reject if \'getOpenPrNumbers()\' rejects', async () => {
      cleanerGetOpenPrNumbersSpy.and.rejectWith('Test');
      await expectAsync(cleaner.cleanUp()).toBeRejectedWith('Test');
    });


    it('should reject if \'getExistingBuildNumbers()\' rejects', async () => {
      cleanerGetExistingBuildNumbersSpy.and.rejectWith('Test');
      await expectAsync(cleaner.cleanUp()).toBeRejectedWith('Test');
    });


    it('should reject if \'getExistingDownloads()\' rejects', async () => {
      cleanerGetExistingDownloadsSpy.and.rejectWith('Test');
      await expectAsync(cleaner.cleanUp()).toBeRejectedWith('Test');
    });


    it('should reject if \'removeUnnecessaryBuilds()\' rejects', async () => {
      cleanerRemoveUnnecessaryBuildsSpy.and.rejectWith('Test');
      await expectAsync(cleaner.cleanUp()).toBeRejectedWith('Test');
    });


    it('should reject if \'removeUnnecessaryDownloads()\' rejects', async () => {
      cleanerRemoveUnnecessaryDownloadsSpy.and.rejectWith('Test');
      await expectAsync(cleaner.cleanUp()).toBeRejectedWith('Test');
    });

  });


  describe('getExistingBuildNumbers()', () => {
    let fsReaddirSpy: jasmine.Spy;
    let readdirCb: (err: any, files?: string[]) => void;
    let promise: Promise<number[]>;

    beforeEach(() => {
      fsReaddirSpy = spyOn(fs, 'readdir').and.callFake(
        ((_: string, cb: typeof readdirCb) => readdirCb = cb) as unknown as typeof fs.readdir,
      );
      promise = cleaner.getExistingBuildNumbers();
    });


    it('should return a promise', () => {
      expect(promise).toBeInstanceOf(Promise);
    });


    it('should get the contents of the builds directory', () => {
      expect(fsReaddirSpy).toHaveBeenCalled();
      expect(fsReaddirSpy.calls.argsFor(0)[0]).toBe('/foo/bar');
    });


    it('should reject if an error occurs while getting the files', async () => {
      readdirCb('Test');
      await expectAsync(promise).toBeRejectedWith('Test');
    });


    it('should resolve with the returned files (as numbers)', async () => {
      readdirCb(null, ['12', '34', '56']);
      await expectAsync(promise).toBeResolvedTo([12, 34, 56]);
    });


    it('should remove `HIDDEN_DIR_PREFIX` from the filenames', async () => {
      readdirCb(null, [`${HIDDEN_DIR_PREFIX}12`, '34', `${HIDDEN_DIR_PREFIX}56`]);
      await expectAsync(promise).toBeResolvedTo([12, 34, 56]);
    });


    it('should ignore files with non-numeric (or zero) names', async () => {
      readdirCb(null, ['12', 'foo', '34', 'bar', '56', '000']);
      await expectAsync(promise).toBeResolvedTo([12, 34, 56]);
    });

  });


  describe('getOpenPrNumbers()', () => {
    let prDeferred: {resolve: (v: any) => void, reject: (v: any) => void};
    let promise: Promise<number[]>;

    beforeEach(() => {
      spyOn(GithubPullRequests.prototype, 'fetchAll').and.callFake(() => {
        return new Promise((resolve, reject) => prDeferred = {resolve, reject});
      });

      promise = cleaner.getOpenPrNumbers();
    });


    it('should return a promise', () => {
      expect(promise).toBeInstanceOf(Promise);
    });


    it('should fetch open PRs via \'GithubPullRequests\'', () => {
      expect(GithubPullRequests.prototype.fetchAll).toHaveBeenCalledWith('open');
    });


    it('should reject if an error occurs while fetching PRs', async () => {
      prDeferred.reject('Test');
      await expectAsync(promise).toBeRejectedWith('Test');
    });


    it('should resolve with the numbers of the fetched PRs', async () => {
      prDeferred.resolve([{id: 0, number: 1}, {id: 1, number: 2}, {id: 2, number: 3}]);
      await expectAsync(promise).toBeResolvedTo([1, 2, 3]);
    });

  });


  describe('getExistingDownloads()', () => {
    let fsReaddirSpy: jasmine.Spy;
    let readdirCb: (err: any, files?: string[]) => void;
    let promise: Promise<string[]>;

    beforeEach(() => {
      fsReaddirSpy = spyOn(fs, 'readdir').and.callFake(
        ((_: string, cb: typeof readdirCb) => readdirCb = cb) as unknown as typeof fs.readdir,
      );
      promise = cleaner.getExistingDownloads();
    });


    it('should return a promise', () => {
      expect(promise).toBeInstanceOf(Promise);
    });


    it('should get the contents of the downloads directory', () => {
      expect(fsReaddirSpy).toHaveBeenCalled();
      expect(fsReaddirSpy.calls.argsFor(0)[0]).toBe('/downloads');
    });


    it('should reject if an error occurs while getting the files', async () => {
      readdirCb('Test');
      await expectAsync(promise).toBeRejectedWith('Test');
    });


    it('should resolve with the returned file names', async () => {
      readdirCb(null, EXISTING_DOWNLOADS);
      await expectAsync(promise).toBeResolvedTo(EXISTING_DOWNLOADS);
    });


    it('should ignore files that do not match the artifactPath', async () => {
      readdirCb(null, ['10-ABCDEF-build.zip', '20-AAAAAAA-otherfile.zip', '30-FFFFFFF-build.zip']);
      await expectAsync(promise).toBeResolvedTo(['10-ABCDEF-build.zip', '30-FFFFFFF-build.zip']);
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


    it('should test if the directory exists (and return if it does not)', () => {
      shellTestSpy.and.returnValue(false);
      cleaner.removeDir('/foo/bar');

      expect(shellTestSpy).toHaveBeenCalledWith('-d', '/foo/bar');
      expect(shellChmodSpy).not.toHaveBeenCalled();
      expect(shellRmSpy).not.toHaveBeenCalled();
    });


    it('should remove the specified directory and its content', () => {
      cleaner.removeDir('/foo/bar');
      expect(shellRmSpy).toHaveBeenCalledWith('-rf', '/foo/bar');
    });


    it('should make the directory and its content writable before removing', () => {
      cleaner.removeDir('/foo/bar');

      expect(shellChmodSpy).toHaveBeenCalledBefore(shellRmSpy);
      expect(shellChmodSpy).toHaveBeenCalledWith('-R', 'a+w', '/foo/bar');
      expect(shellRmSpy).toHaveBeenCalled();
    });


    it('should catch errors and log them', () => {
      shellRmSpy.and.throwError('Test');
      cleaner.removeDir('/foo/bar');

      expect(loggerErrorSpy).toHaveBeenCalledWith('ERROR: Unable to remove \'/foo/bar\' due to:', new Error('Test'));
    });

  });


  describe('removeUnnecessaryBuilds()', () => {
    let cleanerRemoveDirSpy: jasmine.Spy;

    beforeEach(() => {
      cleanerRemoveDirSpy = spyOn(cleaner, 'removeDir');
    });


    it('should log the number of existing builds and builds to be removed', () => {
      cleaner.removeUnnecessaryBuilds([1, 2, 3], [3, 4, 5, 6]);

      expect(loggerLogSpy).toHaveBeenCalledWith('Existing builds: 3');
      expect(loggerLogSpy).toHaveBeenCalledWith('Removing 2 build(s): 1, 2');
    });


    it('should construct full paths to directories (by prepending \'buildsDir\')', () => {
      cleaner.removeUnnecessaryBuilds([1, 2, 3], []);

      expect(cleanerRemoveDirSpy).toHaveBeenCalledWith(normalize('/foo/bar/1'));
      expect(cleanerRemoveDirSpy).toHaveBeenCalledWith(normalize('/foo/bar/2'));
      expect(cleanerRemoveDirSpy).toHaveBeenCalledWith(normalize('/foo/bar/3'));
    });


    it('should try removing hidden directories as well', () => {
      cleaner.removeUnnecessaryBuilds([1, 2, 3], []);

      expect(cleanerRemoveDirSpy).toHaveBeenCalledWith(normalize(`/foo/bar/${HIDDEN_DIR_PREFIX}1`));
      expect(cleanerRemoveDirSpy).toHaveBeenCalledWith(normalize(`/foo/bar/${HIDDEN_DIR_PREFIX}2`));
      expect(cleanerRemoveDirSpy).toHaveBeenCalledWith(normalize(`/foo/bar/${HIDDEN_DIR_PREFIX}3`));
    });


    it('should remove the builds that do not correspond to open PRs', () => {
      cleaner.removeUnnecessaryBuilds([1, 2, 3, 4], [2, 4]);
      expect(cleanerRemoveDirSpy).toHaveBeenCalledTimes(4);
      expect(cleanerRemoveDirSpy).toHaveBeenCalledWith(normalize('/foo/bar/1'));
      expect(cleanerRemoveDirSpy).toHaveBeenCalledWith(normalize('/foo/bar/3'));
      expect(cleanerRemoveDirSpy).toHaveBeenCalledWith(normalize(`/foo/bar/${HIDDEN_DIR_PREFIX}1`));
      expect(cleanerRemoveDirSpy).toHaveBeenCalledWith(normalize(`/foo/bar/${HIDDEN_DIR_PREFIX}3`));
      cleanerRemoveDirSpy.calls.reset();

      cleaner.removeUnnecessaryBuilds([1, 2, 3, 4], [1, 2, 3, 4]);
      expect(cleanerRemoveDirSpy).toHaveBeenCalledTimes(0);
      cleanerRemoveDirSpy.calls.reset();

      cleaner.removeUnnecessaryBuilds([1, 2, 3, 4], []);
      expect(cleanerRemoveDirSpy).toHaveBeenCalledTimes(8);
      expect(cleanerRemoveDirSpy).toHaveBeenCalledWith(normalize('/foo/bar/1'));
      expect(cleanerRemoveDirSpy).toHaveBeenCalledWith(normalize('/foo/bar/2'));
      expect(cleanerRemoveDirSpy).toHaveBeenCalledWith(normalize('/foo/bar/3'));
      expect(cleanerRemoveDirSpy).toHaveBeenCalledWith(normalize('/foo/bar/4'));
      expect(cleanerRemoveDirSpy).toHaveBeenCalledWith(normalize(`/foo/bar/${HIDDEN_DIR_PREFIX}1`));
      expect(cleanerRemoveDirSpy).toHaveBeenCalledWith(normalize(`/foo/bar/${HIDDEN_DIR_PREFIX}2`));
      expect(cleanerRemoveDirSpy).toHaveBeenCalledWith(normalize(`/foo/bar/${HIDDEN_DIR_PREFIX}3`));
      expect(cleanerRemoveDirSpy).toHaveBeenCalledWith(normalize(`/foo/bar/${HIDDEN_DIR_PREFIX}4`));
      cleanerRemoveDirSpy.calls.reset();
    });

  });


  describe('removeUnnecessaryDownloads()', () => {
    let shellRmSpy: jasmine.Spy;

    beforeEach(() => {
      shellRmSpy = spyOn(shell, 'rm');
    });


    it('should log the number of existing downloads and downloads to be removed', () => {
      cleaner.removeUnnecessaryDownloads(EXISTING_DOWNLOADS, OPEN_PRS);

      expect(loggerLogSpy).toHaveBeenCalledWith('Existing downloads: 4');
      expect(loggerLogSpy).toHaveBeenCalledWith('Removing 2 download(s): 20-ABCDEF0-build.zip, 20-1234567-build.zip');
    });


    it('should construct full paths to directories (by prepending \'downloadsDir\')', () => {
      cleaner.removeUnnecessaryDownloads(['dl-1', 'dl-2', 'dl-3'], []);

      expect(shellRmSpy).toHaveBeenCalledWith(normalize('/downloads/dl-1'));
      expect(shellRmSpy).toHaveBeenCalledWith(normalize('/downloads/dl-2'));
      expect(shellRmSpy).toHaveBeenCalledWith(normalize('/downloads/dl-3'));
    });


    it('should remove the downloads that do not correspond to open PRs', () => {
      cleaner.removeUnnecessaryDownloads(EXISTING_DOWNLOADS, OPEN_PRS);
      expect(shellRmSpy).toHaveBeenCalledTimes(2);
      expect(shellRmSpy).toHaveBeenCalledWith(normalize('/downloads/20-ABCDEF0-build.zip'));
      expect(shellRmSpy).toHaveBeenCalledWith(normalize('/downloads/20-1234567-build.zip'));
    });

  });
});

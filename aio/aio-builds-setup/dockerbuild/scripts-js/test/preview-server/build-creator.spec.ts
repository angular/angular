// Imports
import * as cp from 'child_process';
import {EventEmitter} from 'events';
import * as fs from 'fs';
import * as path from 'path';
import * as shell from 'shelljs';
import {SHORT_SHA_LEN} from '../../lib/common/constants';
import {Logger} from '../../lib/common/utils';
import {BuildCreator} from '../../lib/preview-server/build-creator';
import {ChangedPrVisibilityEvent, CreatedBuildEvent} from '../../lib/preview-server/build-events';
import {PreviewServerError} from '../../lib/preview-server/preview-error';
import {customAsyncMatchers} from './jasmine-custom-async-matchers';


// Tests
describe('BuildCreator', () => {
  const pr = 9;
  const sha = '9'.repeat(40);
  const shortSha = sha.substr(0, SHORT_SHA_LEN);
  const archive = 'snapshot.tar.gz';
  const buildsDir = 'builds/dir';
  const hiddenPrDir = path.join(buildsDir, `hidden--${pr}`);
  const publicPrDir = path.join(buildsDir, `${pr}`);
  const hiddenShaDir = path.join(hiddenPrDir, shortSha);
  const publicShaDir = path.join(publicPrDir, shortSha);
  let bc: BuildCreator;

  beforeEach(() => jasmine.addAsyncMatchers(customAsyncMatchers));
  beforeEach(() => bc = new BuildCreator(buildsDir));


  describe('constructor()', () => {

    it('should throw if \'buildsDir\' is missing or empty', () => {
      expect(() => new BuildCreator('')).toThrowError('Missing or empty required parameter \'buildsDir\'!');
    });


    it('should extend EventEmitter', () => {
      expect(bc).toBeInstanceOf(BuildCreator);
      expect(bc).toBeInstanceOf(EventEmitter);

      expect(Object.getPrototypeOf(bc)).toBe(BuildCreator.prototype);
    });

  });


  describe('create()', () => {
    let bcEmitSpy: jasmine.Spy;
    let bcExistsSpy: jasmine.Spy;
    let bcExtractArchiveSpy: jasmine.Spy;
    let bcUpdatePrVisibilitySpy: jasmine.Spy;
    let shellMkdirSpy: jasmine.Spy;
    let shellRmSpy: jasmine.Spy;

    beforeEach(() => {
      bcEmitSpy = spyOn(bc, 'emit');
      bcExistsSpy = spyOn(bc as any, 'exists');
      bcExtractArchiveSpy = spyOn(bc as any, 'extractArchive');
      bcUpdatePrVisibilitySpy = spyOn(bc, 'updatePrVisibility');
      shellMkdirSpy = spyOn(shell, 'mkdir');
      shellRmSpy = spyOn(shell, 'rm');
    });


    [true, false].forEach(isPublic => {
      const prDir = isPublic ? publicPrDir : hiddenPrDir;
      const shaDir = isPublic ? publicShaDir : hiddenShaDir;


      it('should return a promise', async () => {
        const promise = bc.create(pr, sha, archive, isPublic);
        expect(promise).toBeInstanceOf(Promise);

        // Do not complete the test (and release the spies) synchronously to avoid running the actual
        // `extractArchive()`.
        await promise;
      });


      it('should update the PR\'s visibility first if necessary', async () => {
        await bc.create(pr, sha, archive, isPublic);

        expect(bcUpdatePrVisibilitySpy).toHaveBeenCalledBefore(shellMkdirSpy);
        expect(bcUpdatePrVisibilitySpy).toHaveBeenCalledWith(pr, isPublic);
        expect(shellMkdirSpy).toHaveBeenCalled();
      });


      it('should create the build directory (and any parent directories)', async () => {
        await bc.create(pr, sha, archive, isPublic);
        expect(shellMkdirSpy).toHaveBeenCalledWith('-p', shaDir);
      });


      it('should extract the archive contents into the build directory', async () => {
        await bc.create(pr, sha, archive, isPublic);
        expect(bcExtractArchiveSpy).toHaveBeenCalledWith(archive, shaDir);
      });


      it('should emit a CreatedBuildEvent on success', async () => {
        let emitted = false;

        bcEmitSpy.and.callFake((type: string, evt: CreatedBuildEvent) => {
          expect(type).toBe(CreatedBuildEvent.type);
          expect(evt).toBeInstanceOf(CreatedBuildEvent);
          expect(evt.pr).toBe(+pr);
          expect(evt.sha).toBe(shortSha);
          expect(evt.isPublic).toBe(isPublic);

          emitted = true;
        });

        await bc.create(pr, sha, archive, isPublic);
        expect(emitted).toBe(true);
      });


      describe('on error', () => {
        beforeEach(() => {
          bcExistsSpy.and.returnValue(false);
        });


        it('should abort and skip further operations if changing the PR\'s visibility fails', async () => {
          const mockError = new PreviewServerError(543, 'Test');
          bcUpdatePrVisibilitySpy.and.rejectWith(mockError);

          await expectAsync(bc.create(pr, sha, archive, isPublic)).toBeRejectedWith(mockError);

          expect(bcExistsSpy).not.toHaveBeenCalled();
          expect(shellMkdirSpy).not.toHaveBeenCalled();
          expect(bcExtractArchiveSpy).not.toHaveBeenCalled();
          expect(bcEmitSpy).not.toHaveBeenCalled();
        });


        it('should abort and skip further operations if the build does already exist', async () => {
          bcExistsSpy.withArgs(shaDir).and.returnValue(true);

          await expectAsync(bc.create(pr, sha, archive, isPublic)).toBeRejectedWithPreviewServerError(
              409, `Request to overwrite existing ${isPublic ? '' : 'non-'}public directory: ${shaDir}`);

          expect(shellMkdirSpy).not.toHaveBeenCalled();
          expect(bcExtractArchiveSpy).not.toHaveBeenCalled();
          expect(bcEmitSpy).not.toHaveBeenCalled();
        });


        it('should detect existing build directory after visibility change', async () => {
          bcUpdatePrVisibilitySpy.and.callFake(() => bcExistsSpy.and.returnValue(true));

          expect(bcExistsSpy(prDir)).toBe(false);
          expect(bcExistsSpy(shaDir)).toBe(false);

          await expectAsync(bc.create(pr, sha, archive, isPublic)).toBeRejectedWithPreviewServerError(
              409, `Request to overwrite existing ${isPublic ? '' : 'non-'}public directory: ${shaDir}`);

          expect(shellMkdirSpy).not.toHaveBeenCalled();
          expect(bcExtractArchiveSpy).not.toHaveBeenCalled();
          expect(bcEmitSpy).not.toHaveBeenCalled();
        });


        it('should abort and skip further operations if it fails to create the directories', async () => {
          shellMkdirSpy.and.throwError('');

          await expectAsync(bc.create(pr, sha, archive, isPublic)).toBeRejected();

          expect(shellMkdirSpy).toHaveBeenCalled();
          expect(bcExtractArchiveSpy).not.toHaveBeenCalled();
          expect(bcEmitSpy).not.toHaveBeenCalled();
        });


        it('should abort and skip further operations if it fails to extract the archive', async () => {
          bcExtractArchiveSpy.and.throwError('');

          await expectAsync(bc.create(pr, sha, archive, isPublic)).toBeRejected();

          expect(shellMkdirSpy).toHaveBeenCalled();
          expect(bcExtractArchiveSpy).toHaveBeenCalled();
          expect(bcEmitSpy).not.toHaveBeenCalled();
        });


        it('should delete the PR directory (for new PR)', async () => {
          bcExtractArchiveSpy.and.throwError('');

          await expectAsync(bc.create(pr, sha, archive, isPublic)).toBeRejected();
          expect(shellRmSpy).toHaveBeenCalledWith('-rf', prDir);
        });


        it('should delete the SHA directory (for existing PR)', async () => {
          bcExistsSpy.withArgs(prDir).and.returnValue(true);
          bcExtractArchiveSpy.and.throwError('');

          await expectAsync(bc.create(pr, sha, archive, isPublic)).toBeRejected();
          expect(shellRmSpy).toHaveBeenCalledWith('-rf', shaDir);
        });


        it('should reject with an PreviewServerError', async () => {
          // tslint:disable-next-line: no-string-throw
          shellMkdirSpy.and.callFake(() => { throw 'Test'; });

          await expectAsync(bc.create(pr, sha, archive, isPublic)).toBeRejectedWithPreviewServerError(
              500, `Error while creating preview at: ${shaDir}\nTest`);
        });


        it('should pass PreviewServerError instances unmodified', async () => {
          shellMkdirSpy.and.callFake(() => { throw new PreviewServerError(543, 'Test'); });
          await expectAsync(bc.create(pr, sha, archive, isPublic)).toBeRejectedWithPreviewServerError(543, 'Test');
        });

      });

    });

  });


  describe('updatePrVisibility()', () => {
    let bcEmitSpy: jasmine.Spy;
    let bcExistsSpy: jasmine.Spy;
    let bcListShasByDate: jasmine.Spy;
    let shellMvSpy: jasmine.Spy;

    beforeEach(() => {
      bcEmitSpy = spyOn(bc, 'emit');
      bcExistsSpy = spyOn(bc as any, 'exists');
      bcListShasByDate = spyOn(bc as any, 'listShasByDate');
      shellMvSpy = spyOn(shell, 'mv');

      bcExistsSpy.and.returnValues(Promise.resolve(true), Promise.resolve(false));
      bcListShasByDate.and.returnValue([]);
    });


    it('should return a promise', async () => {
      const promise = bc.updatePrVisibility(pr, true);
      expect(promise).toBeInstanceOf(Promise);

      // Do not complete the test (and release the spies) synchronously to avoid running the actual `extractArchive()`.
      await promise;
    });


    [true, false].forEach(makePublic => {
      const oldPrDir = makePublic ? hiddenPrDir : publicPrDir;
      const newPrDir = makePublic ? publicPrDir : hiddenPrDir;


      it('should rename the directory', async () => {
        await bc.updatePrVisibility(pr, makePublic);
        expect(shellMvSpy).toHaveBeenCalledWith(oldPrDir, newPrDir);
      });


      describe('when the visibility is updated', () => {

        it('should resolve to true', async () => {
          await expectAsync(bc.updatePrVisibility(pr, makePublic)).toBeResolvedTo(true);
        });


        it('should rename the directory', async () => {
          await bc.updatePrVisibility(pr, makePublic);
          expect(shellMvSpy).toHaveBeenCalledWith(oldPrDir, newPrDir);
        });


        it('should emit a ChangedPrVisibilityEvent on success', async () => {
          let emitted = false;

          bcEmitSpy.and.callFake((type: string, evt: ChangedPrVisibilityEvent) => {
            expect(type).toBe(ChangedPrVisibilityEvent.type);
            expect(evt).toBeInstanceOf(ChangedPrVisibilityEvent);
            expect(evt.pr).toBe(+pr);
            expect(evt.shas).toBeInstanceOf(Array);
            expect(evt.isPublic).toBe(makePublic);

            emitted = true;
          });

          await bc.updatePrVisibility(pr, makePublic);
          expect(emitted).toBe(true);
        });


        it('should include all shas in the emitted event', async () => {
          const shas = ['foo', 'bar', 'baz'];
          let emitted = false;

          bcListShasByDate.and.resolveTo(shas);
          bcEmitSpy.and.callFake((type: string, evt: ChangedPrVisibilityEvent) => {
            expect(bcListShasByDate).toHaveBeenCalledWith(newPrDir);

            expect(type).toBe(ChangedPrVisibilityEvent.type);
            expect(evt).toBeInstanceOf(ChangedPrVisibilityEvent);
            expect(evt.pr).toBe(+pr);
            expect(evt.shas).toBe(shas);
            expect(evt.isPublic).toBe(makePublic);

            emitted = true;
          });

          await bc.updatePrVisibility(pr, makePublic);
          expect(emitted).toBe(true);
        });

      });


      it('should do nothing if the visibility is already up-to-date', async () => {
        bcExistsSpy.and.callFake((dir: string) => dir === newPrDir);

        await expectAsync(bc.updatePrVisibility(pr, makePublic)).toBeResolvedTo(false);

        expect(shellMvSpy).not.toHaveBeenCalled();
        expect(bcListShasByDate).not.toHaveBeenCalled();
        expect(bcEmitSpy).not.toHaveBeenCalled();
      });


      it('should do nothing if the PR directory does not exist', async () => {
        bcExistsSpy.and.returnValue(false);

        await expectAsync(bc.updatePrVisibility(pr, makePublic)).toBeResolvedTo(false);

        expect(shellMvSpy).not.toHaveBeenCalled();
        expect(bcListShasByDate).not.toHaveBeenCalled();
        expect(bcEmitSpy).not.toHaveBeenCalled();
      });


      describe('on error', () => {

        it('should abort and skip further operations if both directories exist', async () => {
          bcExistsSpy.and.returnValue(true);

          await expectAsync(bc.updatePrVisibility(pr, makePublic)).toBeRejectedWithPreviewServerError(
              409, `Request to move '${oldPrDir}' to existing directory '${newPrDir}'.`);

          expect(shellMvSpy).not.toHaveBeenCalled();
          expect(bcListShasByDate).not.toHaveBeenCalled();
          expect(bcEmitSpy).not.toHaveBeenCalled();
        });


        it('should abort and skip further operations if it fails to rename the directory', async () => {
          shellMvSpy.and.throwError('');

          await expectAsync(bc.updatePrVisibility(pr, makePublic)).toBeRejected();

          expect(shellMvSpy).toHaveBeenCalled();
          expect(bcListShasByDate).not.toHaveBeenCalled();
          expect(bcEmitSpy).not.toHaveBeenCalled();
        });


        it('should abort and skip further operations if it fails to list the SHAs', async () => {
          bcListShasByDate.and.throwError('');

          await expectAsync(bc.updatePrVisibility(pr, makePublic)).toBeRejected();

          expect(shellMvSpy).toHaveBeenCalled();
          expect(bcListShasByDate).toHaveBeenCalled();
          expect(bcEmitSpy).not.toHaveBeenCalled();
        });


        it('should reject with an PreviewServerError', async () => {
          // tslint:disable-next-line: no-string-throw
          shellMvSpy.and.callFake(() => { throw 'Test'; });
          await expectAsync(bc.updatePrVisibility(pr, makePublic)).toBeRejectedWithPreviewServerError(
              500, `Error while making PR ${pr} ${makePublic ? 'public' : 'hidden'}.\nTest`);
        });


        it('should pass PreviewServerError instances unmodified', async () => {
          shellMvSpy.and.callFake(() => { throw new PreviewServerError(543, 'Test'); });
          await expectAsync(bc.updatePrVisibility(pr, makePublic)).toBeRejectedWithPreviewServerError(543, 'Test');
        });

      });

    });

  });


  // Protected methods

  describe('exists()', () => {
    let fsAccessSpy: jasmine.Spy;
    let fsAccessCbs: ((v?: any) => void)[];

    beforeEach(() => {
      fsAccessCbs = [];
      fsAccessSpy = spyOn(fs, 'access').and.callFake(
        ((_: string, cb: (v?: any) => void) => fsAccessCbs.push(cb)) as unknown as typeof fs.access,
      );
    });


    it('should return a promise', () => {
      expect((bc as any).exists('foo')).toBeInstanceOf(Promise);
    });


    it('should call \'fs.access()\' with the specified argument', () => {
      (bc as any).exists('foo');
      expect(fsAccessSpy).toHaveBeenCalledWith('foo', jasmine.any(Function));
    });


    it('should resolve with \'true\' if \'fs.access()\' succeeds', async () => {
      const existsPromises = [
        (bc as any).exists('foo'),
        (bc as any).exists('bar'),
      ];

      fsAccessCbs[0]();
      fsAccessCbs[1](null);

      await expectAsync(Promise.all(existsPromises)).toBeResolvedTo([true, true]);
    });


    it('should resolve with \'false\' if \'fs.access()\' errors', async () => {
      const existsPromises = [
        (bc as any).exists('foo'),
        (bc as any).exists('bar'),
      ];

      fsAccessCbs[0]('Error');
      fsAccessCbs[1](new Error());

      await expectAsync(Promise.all(existsPromises)).toBeResolvedTo([false, false]);
    });

  });


  describe('extractArchive()', () => {
    let consoleWarnSpy: jasmine.Spy;
    let shellChmodSpy: jasmine.Spy;
    let shellRmSpy: jasmine.Spy;
    let cpExecSpy: jasmine.Spy;
    let cpExecCbs: ((...args: any[]) => void)[];

    beforeEach(() => {
      cpExecCbs = [];

      consoleWarnSpy = spyOn(Logger.prototype, 'warn');
      shellChmodSpy = spyOn(shell, 'chmod');
      shellRmSpy = spyOn(shell, 'rm');
      cpExecSpy = spyOn(cp, 'exec').and.callFake(
        ((_: string, cb: (...args: any[]) => void) =>
          cpExecCbs.push(cb)) as unknown as typeof cp.exec,
      );
    });


    it('should return a promise', () => {
      expect((bc as any).extractArchive('foo', 'bar')).toBeInstanceOf(Promise);
    });


    it('should "gunzip" and "untar" the input file into the output directory', () => {
      const cmd = 'tar --extract --gzip --directory "output/dir" --file "input/file"';

      (bc as any).extractArchive('input/file', 'output/dir');
      expect(cpExecSpy).toHaveBeenCalledWith(cmd, jasmine.any(Function));
    });


    it('should log (as a warning) any stderr output if extracting succeeded', async () => {
      const extractPromise = (bc as any).extractArchive('foo', 'bar');
      cpExecCbs[0](null, 'This is stdout', 'This is stderr');

      await expectAsync(extractPromise).toBeResolved();
      expect(consoleWarnSpy).toHaveBeenCalledWith('This is stderr');
    });


    it('should make the build directory non-writable', async () => {
      const extractPromise = (bc as any).extractArchive('foo', 'bar');
      cpExecCbs[0]();

      await expectAsync(extractPromise).toBeResolved();
      expect(shellChmodSpy).toHaveBeenCalledWith('-R', 'a-w', 'bar');
    });


    it('should delete the build artifact file on success', async () => {
      const extractPromise = (bc as any).extractArchive('input/file', 'output/dir');
      cpExecCbs[0]();

      await expectAsync(extractPromise).toBeResolved();
      expect(shellRmSpy).toHaveBeenCalledWith('-f', 'input/file');
    });


    describe('on error', () => {

      it('should abort and skip further operations if it fails to extract the archive', async () => {
        const extractPromise = (bc as any).extractArchive('foo', 'bar');
        cpExecCbs[0]('Test');

        await expectAsync(extractPromise).toBeRejectedWith('Test');
        expect(shellChmodSpy).not.toHaveBeenCalled();
        expect(shellRmSpy).not.toHaveBeenCalled();
      });


      it('should abort and skip further operations if it fails to make non-writable', async () => {
        // tslint:disable-next-line: no-string-throw
        shellChmodSpy.and.callFake(() => { throw 'Test'; });

        const extractPromise = (bc as any).extractArchive('foo', 'bar');
        cpExecCbs[0]();

        await expectAsync(extractPromise).toBeRejectedWith('Test');
        expect(shellChmodSpy).toHaveBeenCalled();
        expect(shellRmSpy).not.toHaveBeenCalled();
      });


      it('should abort and reject if it fails to remove the build artifact file', async () => {
        // tslint:disable-next-line: no-string-throw
        shellRmSpy.and.callFake(() => { throw 'Test'; });

        const extractPromise = (bc as any).extractArchive('foo', 'bar');
        cpExecCbs[0]();

        await expectAsync(extractPromise).toBeRejectedWith('Test');
        expect(shellChmodSpy).toHaveBeenCalled();
        expect(shellRmSpy).toHaveBeenCalled();
      });

    });

  });


  describe('listShasByDate()', () => {
    let shellLsSpy: jasmine.Spy;
    const lsResult = (name: string, mtimeMs: number, isDirectory = true) => ({
      isDirectory: () => isDirectory,
      mtime: new Date(mtimeMs),
      name,
    });

    beforeEach(() => {
      shellLsSpy = spyOn(shell, 'ls').and.returnValue([] as unknown as shell.ShellArray);
    });


    it('should return a promise', async () => {
      const promise = (bc as any).listShasByDate('input/dir');
      expect(promise).toBeInstanceOf(Promise);

      // Do not complete the test (and release the spies) synchronously to avoid running the actual `ls()`.
      await promise;
    });


    it('should `ls()` files with their metadata', async () => {
      await (bc as any).listShasByDate('input/dir');
      expect(shellLsSpy).toHaveBeenCalledWith('-l', 'input/dir');
    });


    it('should reject if listing files fails', async () => {
      shellLsSpy.and.rejectWith('Test');
      await expectAsync((bc as any).listShasByDate('input/dir')).toBeRejectedWith('Test');
    });


    it('should return the filenames', async () => {
      shellLsSpy.and.resolveTo([
        lsResult('foo', 100),
        lsResult('bar', 200),
        lsResult('baz', 300),
      ]);

      await expectAsync((bc as any).listShasByDate('input/dir')).toBeResolvedTo(['foo', 'bar', 'baz']);
    });


    it('should sort by date', async () => {
      shellLsSpy.and.resolveTo([
        lsResult('foo', 300),
        lsResult('bar', 100),
        lsResult('baz', 200),
      ]);

      await expectAsync((bc as any).listShasByDate('input/dir')).toBeResolvedTo(['bar', 'baz', 'foo']);
    });


    it('should not break with ShellJS\' custom `sort()` method', async () => {
      const mockArray = [
        lsResult('foo', 300),
        lsResult('bar', 100),
        lsResult('baz', 200),
      ];
      mockArray.sort = jasmine.createSpy('sort');

      shellLsSpy.and.resolveTo(mockArray);

      await expectAsync((bc as any).listShasByDate('input/dir')).toBeResolvedTo(['bar', 'baz', 'foo']);
      expect(mockArray.sort).not.toHaveBeenCalled();
    });


    it('should only include directories', async () => {
      shellLsSpy.and.resolveTo([
        lsResult('foo', 100),
        lsResult('bar', 200, false),
        lsResult('baz', 300),
      ]);

      await expectAsync((bc as any).listShasByDate('input/dir')).toBeResolvedTo(['foo', 'baz']);
    });

  });

});

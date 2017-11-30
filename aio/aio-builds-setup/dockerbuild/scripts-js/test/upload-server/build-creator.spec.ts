// Imports
import * as cp from 'child_process';
import {EventEmitter} from 'events';
import * as fs from 'fs';
import * as path from 'path';
import * as shell from 'shelljs';
import {SHORT_SHA_LEN} from '../../lib/common/constants';
import {BuildCreator} from '../../lib/upload-server/build-creator';
import {ChangedPrVisibilityEvent, CreatedBuildEvent} from '../../lib/upload-server/build-events';
import {UploadError} from '../../lib/upload-server/upload-error';
import {expectToBeUploadError} from './helpers';

// Tests
describe('BuildCreator', () => {
  const pr = '9';
  const sha = '9'.repeat(40);
  const shortSha = sha.substr(0, SHORT_SHA_LEN);
  const archive = 'snapshot.tar.gz';
  const buildsDir = 'builds/dir';
  const hiddenPrDir = path.join(buildsDir, `hidden--${pr}`);
  const publicPrDir = path.join(buildsDir, pr);
  const hiddenShaDir = path.join(hiddenPrDir, shortSha);
  const publicShaDir = path.join(publicPrDir, shortSha);
  let bc: BuildCreator;

  beforeEach(() => bc = new BuildCreator(buildsDir));


  describe('constructor()', () => {

    it('should throw if \'buildsDir\' is missing or empty', () => {
      expect(() => new BuildCreator('')).toThrowError('Missing or empty required parameter \'buildsDir\'!');
    });


    it('should extend EventEmitter', () => {
      expect(bc).toEqual(jasmine.any(BuildCreator));
      expect(bc).toEqual(jasmine.any(EventEmitter));

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


      it('should return a promise', done => {
        const promise = bc.create(pr, sha, archive, isPublic);
        promise.then(done);   // Do not complete the test (and release the spies) synchronously
                              // to avoid running the actual `extractArchive()`.

        expect(promise).toEqual(jasmine.any(Promise));
      });


      it('should update the PR\'s visibility first if necessary', done => {
        bcUpdatePrVisibilitySpy.and.callFake(() => expect(shellMkdirSpy).not.toHaveBeenCalled());

        bc.create(pr, sha, archive, isPublic).
          then(() => {
            expect(bcUpdatePrVisibilitySpy).toHaveBeenCalledWith(pr, isPublic);
            expect(shellMkdirSpy).toHaveBeenCalled();
          }).
          then(done);
      });


      it('should create the build directory (and any parent directories)', done => {
        bc.create(pr, sha, archive, isPublic).
          then(() => expect(shellMkdirSpy).toHaveBeenCalledWith('-p', shaDir)).
          then(done);
      });


      it('should extract the archive contents into the build directory', done => {
        bc.create(pr, sha, archive, isPublic).
          then(() => expect(bcExtractArchiveSpy).toHaveBeenCalledWith(archive, shaDir)).
          then(done);
      });


      it('should emit a CreatedBuildEvent on success', done => {
        let emitted = false;

        bcEmitSpy.and.callFake((type: string, evt: CreatedBuildEvent) => {
          expect(type).toBe(CreatedBuildEvent.type);
          expect(evt).toEqual(jasmine.any(CreatedBuildEvent));
          expect(evt.pr).toBe(+pr);
          expect(evt.sha).toBe(shortSha);
          expect(evt.isPublic).toBe(isPublic);

          emitted = true;
        });

        bc.create(pr, sha, archive, isPublic).
          then(() => expect(emitted).toBe(true)).
          then(done);
      });


      describe('on error', () => {
        let existsValues: {[dir: string]: boolean};

        beforeEach(() => {
          existsValues = {
            [prDir]: false,
            [shaDir]: false,
          };

          bcExistsSpy.and.callFake((dir: string) => existsValues[dir]);
        });


        it('should abort and skip further operations if changing the PR\'s visibility fails', done => {
          const mockError = new UploadError(543, 'Test');
          bcUpdatePrVisibilitySpy.and.returnValue(Promise.reject(mockError));

          bc.create(pr, sha, archive, isPublic).catch(err => {
            expect(err).toBe(mockError);

            expect(bcExistsSpy).not.toHaveBeenCalled();
            expect(shellMkdirSpy).not.toHaveBeenCalled();
            expect(bcExtractArchiveSpy).not.toHaveBeenCalled();
            expect(bcEmitSpy).not.toHaveBeenCalled();

            done();
          });
        });


        it('should abort and skip further operations if the build does already exist', done => {
          existsValues[shaDir] = true;
          bc.create(pr, sha, archive, isPublic).catch(err => {
            const publicOrNot = isPublic ? 'public' : 'non-public';
            expectToBeUploadError(err, 409, `Request to overwrite existing ${publicOrNot} directory: ${shaDir}`);
            expect(shellMkdirSpy).not.toHaveBeenCalled();
            expect(bcExtractArchiveSpy).not.toHaveBeenCalled();
            expect(bcEmitSpy).not.toHaveBeenCalled();
            done();
          });
        });


        it('should detect existing build directory after visibility change', done => {
          bcUpdatePrVisibilitySpy.and.callFake(() => existsValues[prDir] = existsValues[shaDir] = true);

          expect(bcExistsSpy(prDir)).toBe(false);
          expect(bcExistsSpy(shaDir)).toBe(false);

          bc.create(pr, sha, archive, isPublic).catch(err => {
            const publicOrNot = isPublic ? 'public' : 'non-public';
            expectToBeUploadError(err, 409, `Request to overwrite existing ${publicOrNot} directory: ${shaDir}`);
            expect(shellMkdirSpy).not.toHaveBeenCalled();
            expect(bcExtractArchiveSpy).not.toHaveBeenCalled();
            expect(bcEmitSpy).not.toHaveBeenCalled();
            done();
          });
        });


        it('should abort and skip further operations if it fails to create the directories', done => {
          shellMkdirSpy.and.throwError('');
          bc.create(pr, sha, archive, isPublic).catch(() => {
            expect(shellMkdirSpy).toHaveBeenCalled();
            expect(bcExtractArchiveSpy).not.toHaveBeenCalled();
            expect(bcEmitSpy).not.toHaveBeenCalled();
            done();
          });
        });


        it('should abort and skip further operations if it fails to extract the archive', done => {
          bcExtractArchiveSpy.and.throwError('');
          bc.create(pr, sha, archive, isPublic).catch(() => {
            expect(shellMkdirSpy).toHaveBeenCalled();
            expect(bcExtractArchiveSpy).toHaveBeenCalled();
            expect(bcEmitSpy).not.toHaveBeenCalled();
            done();
          });
        });


        it('should delete the PR directory (for new PR)', done => {
          bcExtractArchiveSpy.and.throwError('');
          bc.create(pr, sha, archive, isPublic).catch(() => {
            expect(shellRmSpy).toHaveBeenCalledWith('-rf', prDir);
            done();
          });
        });


        it('should delete the SHA directory (for existing PR)', done => {
          existsValues[prDir] = true;
          bcExtractArchiveSpy.and.throwError('');

          bc.create(pr, sha, archive, isPublic).catch(() => {
            expect(shellRmSpy).toHaveBeenCalledWith('-rf', shaDir);
            done();
          });
        });


        it('should reject with an UploadError', done => {
          // tslint:disable-next-line: no-string-throw
          shellMkdirSpy.and.callFake(() => { throw 'Test'; });
          bc.create(pr, sha, archive, isPublic).catch(err => {
            expectToBeUploadError(err, 500, `Error while uploading to directory: ${shaDir}\nTest`);
            done();
          });
        });


        it('should pass UploadError instances unmodified', done => {
          shellMkdirSpy.and.callFake(() => { throw new UploadError(543, 'Test'); });
          bc.create(pr, sha, archive, isPublic).catch(err => {
            expectToBeUploadError(err, 543, 'Test');
            done();
          });
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


    it('should return a promise', done => {
      const promise = bc.updatePrVisibility(pr, true);
      promise.then(done);   // Do not complete the test (and release the spies) synchronously
                            // to avoid running the actual `extractArchive()`.

      expect(promise).toEqual(jasmine.any(Promise));
    });


    [true, false].forEach(makePublic => {
      const oldPrDir = makePublic ? hiddenPrDir : publicPrDir;
      const newPrDir = makePublic ? publicPrDir : hiddenPrDir;


      it('should rename the directory', done => {
        bc.updatePrVisibility(pr, makePublic).
          then(() => expect(shellMvSpy).toHaveBeenCalledWith(oldPrDir, newPrDir)).
          then(done);
      });


      describe('when the visibility is updated', () => {

        it('should resolve to true', done => {
          bc.updatePrVisibility(pr, makePublic).
            then(result => expect(result).toBe(true)).
            then(done);
        });


        it('should rename the directory', done => {
          bc.updatePrVisibility(pr, makePublic).
            then(() => expect(shellMvSpy).toHaveBeenCalledWith(oldPrDir, newPrDir)).
            then(done);
        });


        it('should emit a ChangedPrVisibilityEvent on success', done => {
          let emitted = false;

          bcEmitSpy.and.callFake((type: string, evt: ChangedPrVisibilityEvent) => {
            expect(type).toBe(ChangedPrVisibilityEvent.type);
            expect(evt).toEqual(jasmine.any(ChangedPrVisibilityEvent));
            expect(evt.pr).toBe(+pr);
            expect(evt.shas).toEqual(jasmine.any(Array));
            expect(evt.isPublic).toBe(makePublic);

            emitted = true;
          });

          bc.updatePrVisibility(pr, makePublic).
            then(() => expect(emitted).toBe(true)).
            then(done);
        });


        it('should include all shas in the emitted event', done => {
          const shas = ['foo', 'bar', 'baz'];
          let emitted = false;

          bcListShasByDate.and.returnValue(Promise.resolve(shas));
          bcEmitSpy.and.callFake((type: string, evt: ChangedPrVisibilityEvent) => {
            expect(bcListShasByDate).toHaveBeenCalledWith(newPrDir);

            expect(type).toBe(ChangedPrVisibilityEvent.type);
            expect(evt).toEqual(jasmine.any(ChangedPrVisibilityEvent));
            expect(evt.pr).toBe(+pr);
            expect(evt.shas).toBe(shas);
            expect(evt.isPublic).toBe(makePublic);

            emitted = true;
          });

          bc.updatePrVisibility(pr, makePublic).
            then(() => expect(emitted).toBe(true)).
            then(done);
        });

      });


      it('should do nothing if the visibility is already up-to-date', done => {
        bcExistsSpy.and.callFake((dir: string) => dir === newPrDir);
        bc.updatePrVisibility(pr, makePublic).
          then(result => {
            expect(result).toBe(false);
            expect(shellMvSpy).not.toHaveBeenCalled();
            expect(bcListShasByDate).not.toHaveBeenCalled();
            expect(bcEmitSpy).not.toHaveBeenCalled();
          }).
          then(done);
      });


      it('should do nothing if the PR directory does not exist', done => {
        bcExistsSpy.and.returnValue(false);
        bc.updatePrVisibility(pr, makePublic).
          then(result => {
            expect(result).toBe(false);
            expect(shellMvSpy).not.toHaveBeenCalled();
            expect(bcListShasByDate).not.toHaveBeenCalled();
            expect(bcEmitSpy).not.toHaveBeenCalled();
          }).
          then(done);
      });


      describe('on error', () => {

        it('should abort and skip further operations if both directories exist', done => {
          bcExistsSpy.and.returnValue(true);
          bc.updatePrVisibility(pr, makePublic).catch(err => {
            expectToBeUploadError(err, 409, `Request to move '${oldPrDir}' to existing directory '${newPrDir}'.`);
            expect(shellMvSpy).not.toHaveBeenCalled();
            expect(bcListShasByDate).not.toHaveBeenCalled();
            expect(bcEmitSpy).not.toHaveBeenCalled();
            done();
          });
        });


        it('should abort and skip further operations if it fails to rename the directory', done => {
          shellMvSpy.and.throwError('');
          bc.updatePrVisibility(pr, makePublic).catch(() => {
            expect(shellMvSpy).toHaveBeenCalled();
            expect(bcListShasByDate).not.toHaveBeenCalled();
            expect(bcEmitSpy).not.toHaveBeenCalled();
            done();
          });
        });


        it('should abort and skip further operations if it fails to list the SHAs', done => {
          bcListShasByDate.and.throwError('');
          bc.updatePrVisibility(pr, makePublic).catch(() => {
            expect(shellMvSpy).toHaveBeenCalled();
            expect(bcListShasByDate).toHaveBeenCalled();
            expect(bcEmitSpy).not.toHaveBeenCalled();
            done();
          });
        });


        it('should reject with an UploadError', done => {
          // tslint:disable-next-line: no-string-throw
          shellMvSpy.and.callFake(() => { throw 'Test'; });
          bc.updatePrVisibility(pr, makePublic).catch(err => {
            expectToBeUploadError(err, 500, `Error while making PR ${pr} ${makePublic ? 'public' : 'hidden'}.\nTest`);
            done();
          });
        });


        it('should pass UploadError instances unmodified', done => {
          shellMvSpy.and.callFake(() => { throw new UploadError(543, 'Test'); });
          bc.updatePrVisibility(pr, makePublic).catch(err => {
            expectToBeUploadError(err, 543, 'Test');
            done();
          });
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
      fsAccessSpy = spyOn(fs, 'access').and.callFake((_: string, cb: (v?: any) => void) => fsAccessCbs.push(cb));
    });


    it('should return a promise', () => {
      expect((bc as any).exists('foo')).toEqual(jasmine.any(Promise));
    });


    it('should call \'fs.access()\' with the specified argument', () => {
      (bc as any).exists('foo');
      expect(fs.access).toHaveBeenCalledWith('foo', jasmine.any(Function));
    });


    it('should resolve with \'true\' if \'fs.access()\' succeeds', done => {
      Promise.
        all([(bc as any).exists('foo'), (bc as any).exists('bar')]).
        then(results => expect(results).toEqual([true, true])).
        then(done);

      fsAccessCbs[0]();
      fsAccessCbs[1](null);
    });


    it('should resolve with \'false\' if \'fs.access()\' errors', done => {
      Promise.
        all([(bc as any).exists('foo'), (bc as any).exists('bar')]).
        then(results => expect(results).toEqual([false, false])).
        then(done);

      fsAccessCbs[0]('Error');
      fsAccessCbs[1](new Error());
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

      consoleWarnSpy = spyOn(console, 'warn');
      shellChmodSpy = spyOn(shell, 'chmod');
      shellRmSpy = spyOn(shell, 'rm');
      cpExecSpy = spyOn(cp, 'exec').and.callFake((_: string, cb: (...args: any[]) => void) => cpExecCbs.push(cb));
    });


    it('should return a promise', () => {
      expect((bc as any).extractArchive('foo', 'bar')).toEqual(jasmine.any(Promise));
    });


    it('should "gunzip" and "untar" the input file into the output directory', () => {
      const cmd = 'tar --extract --gzip --directory "output/dir" --file "input/file"';

      (bc as any).extractArchive('input/file', 'output/dir');
      expect(cpExecSpy).toHaveBeenCalledWith(cmd, jasmine.any(Function));
    });


    it('should log (as a warning) any stderr output if extracting succeeded', done => {
      (bc as any).extractArchive('foo', 'bar').
        then(() => expect(consoleWarnSpy).toHaveBeenCalledWith('This is stderr')).
        then(done);

      cpExecCbs[0](null, 'This is stdout', 'This is stderr');
    });


    it('should make the build directory non-writable', done => {
      (bc as any).extractArchive('foo', 'bar').
        then(() => expect(shellChmodSpy).toHaveBeenCalledWith('-R', 'a-w', 'bar')).
        then(done);

      cpExecCbs[0]();
    });


    it('should delete the uploaded file on success', done => {
      (bc as any).extractArchive('input/file', 'output/dir').
        then(() => expect(shellRmSpy).toHaveBeenCalledWith('-f', 'input/file')).
        then(done);

      cpExecCbs[0]();
    });


    describe('on error', () => {

      it('should abort and skip further operations if it fails to extract the archive', done => {
        (bc as any).extractArchive('foo', 'bar').catch((err: any) => {
          expect(shellChmodSpy).not.toHaveBeenCalled();
          expect(shellRmSpy).not.toHaveBeenCalled();
          expect(err).toBe('Test');
          done();
        });

        cpExecCbs[0]('Test');
      });


      it('should abort and skip further operations if it fails to make non-writable', done => {
        (bc as any).extractArchive('foo', 'bar').catch((err: any) => {
          expect(shellChmodSpy).toHaveBeenCalled();
          expect(shellRmSpy).not.toHaveBeenCalled();
          expect(err).toBe('Test');
          done();
        });

        shellChmodSpy.and.callFake(() => {
          // tslint:disable-next-line: no-string-throw
          throw 'Test';
        });

        cpExecCbs[0]();
      });


      it('should abort and reject if it fails to remove the uploaded file', done => {
        (bc as any).extractArchive('foo', 'bar').catch((err: any) => {
          expect(shellChmodSpy).toHaveBeenCalled();
          expect(shellRmSpy).toHaveBeenCalled();
          expect(err).toBe('Test');
          done();
        });

        shellRmSpy.and.callFake(() => {
          // tslint:disable-next-line: no-string-throw
          throw 'Test';
        });

        cpExecCbs[0]();
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
      shellLsSpy = spyOn(shell, 'ls').and.returnValue([]);
    });


    it('should return a promise', done => {
      const promise = (bc as any).listShasByDate('input/dir');
      promise.then(done);   // Do not complete the test (and release the spies) synchronously
                            // to avoid running the actual `ls()`.

      expect(promise).toEqual(jasmine.any(Promise));
    });


    it('should `ls()` files with their metadata', done => {
      (bc as any).listShasByDate('input/dir').
        then(() => expect(shellLsSpy).toHaveBeenCalledWith('-l', 'input/dir')).
        then(done);
    });


    it('should reject if listing files fails', done => {
      shellLsSpy.and.returnValue(Promise.reject('Test'));
      (bc as any).listShasByDate('input/dir').catch((err: string) => {
        expect(err).toBe('Test');
        done();
      });
    });


    it('should return the filenames', done => {
      shellLsSpy.and.returnValue(Promise.resolve([
        lsResult('foo', 100),
        lsResult('bar', 200),
        lsResult('baz', 300),
      ]));

      (bc as any).listShasByDate('input/dir').
        then((shas: string[]) => expect(shas).toEqual(['foo', 'bar', 'baz'])).
        then(done);
    });


    it('should sort by date', done => {
      shellLsSpy.and.returnValue(Promise.resolve([
        lsResult('foo', 300),
        lsResult('bar', 100),
        lsResult('baz', 200),
      ]));

      (bc as any).listShasByDate('input/dir').
        then((shas: string[]) => expect(shas).toEqual(['bar', 'baz', 'foo'])).
        then(done);
    });


    it('should not break with ShellJS\' custom `sort()` method', done => {
      const mockArray = [
        lsResult('foo', 300),
        lsResult('bar', 100),
        lsResult('baz', 200),
      ];
      mockArray.sort = jasmine.createSpy('sort');

      shellLsSpy.and.returnValue(Promise.resolve(mockArray));
      (bc as any).listShasByDate('input/dir').
        then((shas: string[]) => {
          expect(shas).toEqual(['bar', 'baz', 'foo']);
          expect(mockArray.sort).not.toHaveBeenCalled();
        }).
        then(done);
    });


    it('should only include directories', done => {
      shellLsSpy.and.returnValue(Promise.resolve([
        lsResult('foo', 100),
        lsResult('bar', 200, false),
        lsResult('baz', 300),
      ]));

      (bc as any).listShasByDate('input/dir').
        then((shas: string[]) => expect(shas).toEqual(['foo', 'baz'])).
        then(done);
    });

  });

});

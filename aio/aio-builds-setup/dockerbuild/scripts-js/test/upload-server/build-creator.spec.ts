// Imports
import * as cp from 'child_process';
import {EventEmitter} from 'events';
import * as fs from 'fs';
import * as shell from 'shelljs';
import {BuildCreator} from '../../lib/upload-server/build-creator';
import {CreatedBuildEvent} from '../../lib/upload-server/build-events';
import {UploadError} from '../../lib/upload-server/upload-error';
import {expectToBeUploadError} from './helpers';

// Tests
describe('BuildCreator', () => {
  const pr = '9';
  const sha = '9'.repeat(40);
  const archive = 'snapshot.tar.gz';
  const buildsDir = 'builds/dir';
  const prDir = `${buildsDir}/${pr}`;
  const shaDir = `${prDir}/${sha}`;
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
    let shellMkdirSpy: jasmine.Spy;
    let shellRmSpy: jasmine.Spy;

    beforeEach(() => {
      bcEmitSpy = spyOn(bc, 'emit');
      bcExistsSpy = spyOn(bc as any, 'exists');
      bcExtractArchiveSpy = spyOn(bc as any, 'extractArchive');
      shellMkdirSpy = spyOn(shell, 'mkdir');
      shellRmSpy = spyOn(shell, 'rm');
    });


    it('should return a promise', done => {
      const promise = bc.create(pr, sha, archive);
      promise.then(done);   // Do not complete the test (and release the spies) synchronously
                            // to avoid running the actual `extractArchive()`.

      expect(promise).toEqual(jasmine.any(Promise));
    });


    it('should throw if the build does already exist', done => {
      bcExistsSpy.and.returnValue(true);
      bc.create(pr, sha, archive).catch(err => {
        expectToBeUploadError(err, 409, `Request to overwrite existing directory: ${shaDir}`);
        done();
      });
    });


    it('should create the build directory (and any parent directories)', done => {
      bc.create(pr, sha, archive).
        then(() => expect(shellMkdirSpy).toHaveBeenCalledWith('-p', shaDir)).
        then(done);
    });


    it('should extract the archive contents into the build directory', done => {
      bc.create(pr, sha, archive).
        then(() => expect(bcExtractArchiveSpy).toHaveBeenCalledWith(archive, shaDir)).
        then(done);
    });


    it('should emit a CreatedBuildEvent on success', done => {
      let emitted = false;

      bcEmitSpy.and.callFake((type: string, evt: CreatedBuildEvent) => {
        expect(type).toBe(CreatedBuildEvent.type);
        expect(evt).toEqual(jasmine.any(CreatedBuildEvent));
        expect(evt.pr).toBe(+pr);
        expect(evt.sha).toBe(sha);

        emitted = true;
      });

      bc.create(pr, sha, archive).
        then(() => expect(emitted).toBe(true)).
        then(done);
    });


    describe('on error', () => {

      it('should abort and skip further operations if it fails to create the directories', done => {
        shellMkdirSpy.and.throwError('');
        bc.create(pr, sha, archive).catch(() => {
          expect(shellMkdirSpy).toHaveBeenCalled();
          expect(bcExtractArchiveSpy).not.toHaveBeenCalled();
          expect(bcEmitSpy).not.toHaveBeenCalled();
          done();
        });
      });


      it('should abort and skip further operations if it fails to extract the archive', done => {
        bcExtractArchiveSpy.and.throwError('');
        bc.create(pr, sha, archive).catch(() => {
          expect(shellMkdirSpy).toHaveBeenCalled();
          expect(bcExtractArchiveSpy).toHaveBeenCalled();
          expect(bcEmitSpy).not.toHaveBeenCalled();
          done();
        });
      });


      it('should delete the PR directory (for new PR)', done => {
        bcExtractArchiveSpy.and.throwError('');
        bc.create(pr, sha, archive).catch(() => {
          expect(shellRmSpy).toHaveBeenCalledWith('-rf', prDir);
          done();
        });
      });


      it('should delete the SHA directory (for existing PR)', done => {
        bcExistsSpy.and.callFake((path: string) => path !== shaDir);
        bcExtractArchiveSpy.and.throwError('');

        bc.create(pr, sha, archive).catch(() => {
          expect(shellRmSpy).toHaveBeenCalledWith('-rf', shaDir);
          done();
        });
      });


      it('should reject with an UploadError', done => {
        shellMkdirSpy.and.callFake(() => {throw 'Test'; });
        bc.create(pr, sha, archive).catch(err => {
          expectToBeUploadError(err, 500, `Error while uploading to directory: ${shaDir}\nTest`);
          done();
        });
      });


      it('should pass UploadError instances unmodified', done => {
        shellMkdirSpy.and.callFake(() => { throw new UploadError(543, 'Test'); });
        bc.create(pr, sha, archive).catch(err => {
          expectToBeUploadError(err, 543, 'Test');
          done();
        });
      });

    });

  });


  // Protected methods

  describe('exists()', () => {
    let fsAccessSpy: jasmine.Spy;
    let fsAccessCbs: Function[];

    beforeEach(() => {
      fsAccessCbs = [];
      fsAccessSpy = spyOn(fs, 'access').and.callFake((_: string, cb: Function) => fsAccessCbs.push(cb));
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
    let cpExecCbs: Function[];

    beforeEach(() => {
      cpExecCbs = [];

      consoleWarnSpy = spyOn(console, 'warn');
      shellChmodSpy = spyOn(shell, 'chmod');
      shellRmSpy = spyOn(shell, 'rm');
      cpExecSpy = spyOn(cp, 'exec').and.callFake((_: string, cb: Function) => cpExecCbs.push(cb));
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

        shellChmodSpy.and.callFake(() => { throw 'Test'; });
        cpExecCbs[0]();
      });


      it('should abort and reject if it fails to remove the uploaded file', done => {
        (bc as any).extractArchive('foo', 'bar').catch((err: any) => {
          expect(shellChmodSpy).toHaveBeenCalled();
          expect(shellRmSpy).toHaveBeenCalled();
          expect(err).toBe('Test');
          done();
        });

        shellRmSpy.and.callFake(() => { throw 'Test'; });
        cpExecCbs[0]();
      });

    });

  });

});

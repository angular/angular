/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {CachedFileSystem} from '../src/cached_file_system';
import {absoluteFrom, setFileSystem} from '../src/helpers';
import {NodeJSFileSystem} from '../src/node_js_file_system';
import {AbsoluteFsPath, FileSystem} from '../src/types';

describe('CachedFileSystem', () => {
  let delegate: FileSystem;
  let fs: CachedFileSystem;
  let abcPath: AbsoluteFsPath;
  let xyzPath: AbsoluteFsPath;

  beforeEach(() => {
    delegate = new NodeJSFileSystem();
    fs = new CachedFileSystem(delegate);
    // Set the file-system so that calls like `absoluteFrom()`
    // and `PathSegment.fromFsPath()` work correctly.
    setFileSystem(fs);
    abcPath = absoluteFrom('/a/b/c');
    xyzPath = absoluteFrom('/x/y/z');
  });

  describe('exists()', () => {
    it('should call delegate if not in cache', () => {
      const spy = spyOn(delegate, 'exists').and.returnValue(true);
      expect(fs.exists(abcPath)).toBe(true);
      expect(spy).toHaveBeenCalledWith(abcPath);
    });

    it('should take from the cache if available', () => {
      const spy = spyOn(delegate, 'exists').and.returnValue(true);
      fs.exists(abcPath);  // Call once to fill the cache
      spy.calls.reset();

      expect(fs.exists(abcPath)).toBe(true);
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('readFile()', () => {
    let lstatSpy: jasmine.Spy;
    beforeEach(() => {
      // For most of the tests the files are not symbolic links.
      lstatSpy = spyOn(delegate, 'lstat').and.returnValue({isSymbolicLink: () => false});
    });

    it('should call delegate if not in cache', () => {
      const spy = spyOn(delegate, 'readFile').and.returnValue('Some contents');
      expect(fs.readFile(abcPath)).toBe('Some contents');
      expect(spy).toHaveBeenCalledWith(abcPath);
    });

    it('should take from the cache if available', () => {
      const spy = spyOn(delegate, 'readFile').and.returnValue('Some contents');
      fs.readFile(abcPath);  // Call once to fill the cache
      spy.calls.reset();

      expect(fs.readFile(abcPath)).toBe('Some contents');
      expect(spy).not.toHaveBeenCalled();
    });

    it('should cache the exception if it originally threw', () => {
      const spy = spyOn(delegate, 'readFile').and.throwError('Some error');
      expect(() => fs.readFile(abcPath)).toThrowError('Some error');
      spy.calls.reset();
      expect(() => fs.readFile(abcPath)).toThrowError('Some error');
      expect(spy).not.toHaveBeenCalled();
    });

    it('should always call delegate (and not cache) if the path is a symbolic link', () => {
      const readFileSpy = spyOn(delegate, 'readFile').and.returnValue('Some contents');
      // Simulate a symlink by overriding `lstat`
      lstatSpy.and.returnValue({isSymbolicLink: () => true});

      // Read the symlink target file contents
      expect(fs.readFile(abcPath)).toEqual('Some contents');
      expect(lstatSpy).toHaveBeenCalledWith(abcPath);

      // Now read it again and check that the cache was not hit
      lstatSpy.calls.reset();
      readFileSpy.calls.reset();
      expect(fs.readFile(abcPath)).toEqual('Some contents');
      expect(lstatSpy).toHaveBeenCalledWith(abcPath);
    });
  });

  describe('writeFile()', () => {
    it('should call delegate', () => {
      const spy = spyOn(delegate, 'writeFile');
      fs.writeFile(abcPath, 'Some contents');
      expect(spy).toHaveBeenCalledWith(abcPath, 'Some contents');
    });

    it('should update the exists and "readFile" caches', () => {
      spyOn(delegate, 'writeFile');
      const existsSpy = spyOn(delegate, 'exists');
      const readFileSpy = spyOn(delegate, 'readFile');

      fs.writeFile(abcPath, 'Some contents');
      expect(fs.readFile(abcPath)).toEqual('Some contents');
      expect(fs.exists(abcPath)).toBe(true);
      expect(existsSpy).not.toHaveBeenCalled();
      expect(readFileSpy).not.toHaveBeenCalled();
    });
  });

  describe('readdir()', () => {
    it('should call delegate', () => {
      const spy = spyOn(delegate, 'readdir');
      fs.readdir(abcPath);
      expect(spy).toHaveBeenCalledWith(abcPath);
    });
  });

  describe('lstat()', () => {
    it('should call delegate', () => {
      const spy = spyOn(delegate, 'lstat');
      fs.lstat(abcPath);
      expect(spy).toHaveBeenCalledWith(abcPath);
    });

    it('should update the "exists" cache', () => {
      spyOn(delegate, 'lstat');
      const existsSpy = spyOn(delegate, 'exists');
      fs.lstat(abcPath);
      expect(fs.exists(abcPath)).toBe(true);
      expect(existsSpy).not.toHaveBeenCalled();
    });
  });

  describe('stat()', () => {
    it('should call delegate', () => {
      const spy = spyOn(delegate, 'stat');
      fs.stat(abcPath);
      expect(spy).toHaveBeenCalledWith(abcPath);
    });

    it('should update the "exists" cache', () => {
      spyOn(delegate, 'stat');
      const existsSpy = spyOn(delegate, 'exists');
      fs.stat(abcPath);
      expect(fs.exists(abcPath)).toBe(true);
      expect(existsSpy).not.toHaveBeenCalled();
    });
  });

  describe('pwd()', () => {
    it('should call delegate', () => {
      const spy = spyOn(delegate, 'pwd');
      fs.pwd();
      expect(spy).toHaveBeenCalledWith();
    });
  });

  describe('copyFile()', () => {
    it('should call delegate', () => {
      const spy = spyOn(delegate, 'copyFile');
      fs.copyFile(abcPath, xyzPath);
      expect(spy).toHaveBeenCalledWith(abcPath, xyzPath);
    });

    it('should update the "exists" cache', () => {
      spyOn(delegate, 'copyFile');
      const existsSpy = spyOn(delegate, 'exists').and.returnValue(false);
      fs.copyFile(abcPath, xyzPath);
      expect(fs.exists(xyzPath)).toEqual(true);
      expect(existsSpy).not.toHaveBeenCalled();
    });
  });

  describe('moveFile()', () => {
    beforeEach(() => {
      // `moveFile()` relies upon `readFile` which calls through to `lstat()`, so stub it out.
      spyOn(delegate, 'lstat').and.returnValue({isSymbolicLink: () => false});
    });

    it('should call delegate', () => {
      const spy = spyOn(delegate, 'moveFile');
      fs.moveFile(abcPath, xyzPath);
      expect(spy).toHaveBeenCalledWith(abcPath, xyzPath);
    });

    it('should update the "exists" cache', () => {
      spyOn(delegate, 'moveFile');
      const existsSpy = spyOn(delegate, 'exists');

      fs.moveFile(abcPath, xyzPath);

      expect(fs.exists(abcPath)).toEqual(false);
      expect(fs.exists(xyzPath)).toEqual(true);
      expect(existsSpy).not.toHaveBeenCalled();
    });

    it('should delete the `from` "readFile" cache', () => {
      spyOn(delegate, 'moveFile');
      const readFileSpy = spyOn(delegate, 'readFile');

      // Fill the abc "readFile" cache
      readFileSpy.and.returnValue('abc content');
      fs.readFile(abcPath);

      // Move the file
      fs.moveFile(abcPath, xyzPath);

      // Emulate an error now that the file has been moved.
      readFileSpy.and.throwError('no file');

      // Show that asking for the abc file does not read from the cache
      expect(() => fs.readFile(abcPath)).toThrowError('no file');
      expect(readFileSpy).toHaveBeenCalledWith(abcPath);
    });

    it('should update the `to` "readFile" cache', () => {
      spyOn(delegate, 'moveFile');
      const readFileSpy = spyOn(delegate, 'readFile');

      // Fill the abc "readFile" cache
      readFileSpy.and.returnValue('abc content');
      fs.readFile(abcPath);
      readFileSpy.calls.reset();

      // Move the file
      fs.moveFile(abcPath, xyzPath);

      // Show that the cache was hit for the xyz file
      expect(fs.readFile(xyzPath)).toEqual('abc content');
      expect(readFileSpy).not.toHaveBeenCalled();
    });
  });

  describe('mkdir()', () => {
    it('should call delegate', () => {
      const spy = spyOn(delegate, 'mkdir');
      fs.mkdir(xyzPath);
      expect(spy).toHaveBeenCalledWith(xyzPath);
    });

    it('should update the "exists" cache', () => {
      spyOn(delegate, 'mkdir');
      const existsSpy = spyOn(delegate, 'exists');
      fs.mkdir(xyzPath);
      expect(fs.exists(xyzPath)).toEqual(true);
      expect(existsSpy).not.toHaveBeenCalled();
    });
  });

  describe('ensureDir()', () => {
    it('should call delegate', () => {
      const ensureDirSpy = spyOn(delegate, 'ensureDir');
      fs.ensureDir(abcPath);
      expect(ensureDirSpy).toHaveBeenCalledWith(abcPath);
    });

    it('should update the "exists" cache', () => {
      spyOn(delegate, 'ensureDir');
      const existsSpy = spyOn(delegate, 'exists');
      fs.ensureDir(abcPath);
      existsSpy.calls.reset();
      expect(fs.exists(abcPath)).toEqual(true);
      expect(fs.exists(absoluteFrom('/a/b'))).toEqual(true);
      expect(fs.exists(absoluteFrom('/a'))).toEqual(true);
      expect(existsSpy).not.toHaveBeenCalled();
    });
  });
});

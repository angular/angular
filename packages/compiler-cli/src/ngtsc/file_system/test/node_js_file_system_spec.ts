/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as realFs from 'fs';
import * as os from 'os';
import {NodeJSFileSystem, NodeJSPathManipulation, NodeJSReadonlyFileSystem} from '../src/node_js_file_system';
import {AbsoluteFsPath, PathSegment} from '../src/types';

describe('NodeJSPathManipulation', () => {
  let fs: NodeJSPathManipulation;
  let abcPath: AbsoluteFsPath;
  let xyzPath: AbsoluteFsPath;

  beforeEach(() => {
    fs = new NodeJSPathManipulation();
    abcPath = fs.resolve('/a/b/c');
    xyzPath = fs.resolve('/x/y/z');
  });

  describe('pwd()', () => {
    it('should delegate to process.cwd()', () => {
      const spy = spyOn(process, 'cwd').and.returnValue(abcPath);
      const result = fs.pwd();
      expect(result).toEqual(abcPath);
      expect(spy).toHaveBeenCalledWith();
    });
  });

  if (os.platform() === 'win32') {
    // Only relevant on Windows
    describe('relative', () => {
      it('should handle Windows paths on different drives', () => {
        expect(fs.relative('C:\\a\\b\\c', 'D:\\a\\b\\d')).toEqual(fs.resolve('D:\\a\\b\\d'));
      });
    });
  }
});

describe('NodeJSReadonlyFileSystem', () => {
  let fs: NodeJSReadonlyFileSystem;
  let abcPath: AbsoluteFsPath;
  let xyzPath: AbsoluteFsPath;

  beforeEach(() => {
    fs = new NodeJSReadonlyFileSystem();
    abcPath = fs.resolve('/a/b/c');
    xyzPath = fs.resolve('/x/y/z');
  });

  describe('isCaseSensitive()', () => {
    it('should return true if the FS is case-sensitive', () => {
      const isCaseSensitive = !realFs.existsSync(__filename.toUpperCase());
      expect(fs.isCaseSensitive()).toEqual(isCaseSensitive);
    });
  });

  describe('exists()', () => {
    it('should delegate to fs.existsSync()', () => {
      const spy = spyOn(realFs, 'existsSync').and.returnValues(true, false);
      expect(fs.exists(abcPath)).toBe(true);
      expect(spy).toHaveBeenCalledWith(abcPath);
      expect(fs.exists(xyzPath)).toBe(false);
      expect(spy).toHaveBeenCalledWith(xyzPath);
    });
  });

  describe('readFile()', () => {
    it('should delegate to fs.readFileSync()', () => {
      const spy = spyOn(realFs, 'readFileSync').and.returnValue('Some contents');
      const result = fs.readFile(abcPath);
      expect(result).toBe('Some contents');
      expect(spy).toHaveBeenCalledWith(abcPath, 'utf8');
    });
  });

  describe('readFileBuffer()', () => {
    it('should delegate to fs.readFileSync()', () => {
      const buffer = new Buffer('Some contents');
      const spy = spyOn(realFs, 'readFileSync').and.returnValue(buffer);
      const result = fs.readFileBuffer(abcPath);
      expect(result).toBe(buffer);
      expect(spy).toHaveBeenCalledWith(abcPath);
    });
  });

  describe('readdir()', () => {
    it('should delegate to fs.readdirSync()', () => {
      const spy = spyOn(realFs, 'readdirSync').and.returnValue(['x', 'y/z'] as any);
      const result = fs.readdir(abcPath);
      expect(result).toEqual(['x' as PathSegment, 'y/z' as PathSegment]);
      // TODO: @JiaLiPassion need to wait for @types/jasmine update to handle optional parameters.
      // https://github.com/DefinitelyTyped/DefinitelyTyped/issues/43486
      expect(spy as any).toHaveBeenCalledWith(abcPath);
    });
  });

  describe('lstat()', () => {
    it('should delegate to fs.lstatSync()', () => {
      const stats = new realFs.Stats();
      const spy = spyOn(realFs, 'lstatSync').and.returnValue(stats);
      const result = fs.lstat(abcPath);
      expect(result).toBe(stats);
      expect(spy).toHaveBeenCalledWith(abcPath);
    });
  });

  describe('stat()', () => {
    it('should delegate to fs.statSync()', () => {
      const stats = new realFs.Stats();
      const spy = spyOn(realFs, 'statSync').and.returnValue(stats);
      const result = fs.stat(abcPath);
      expect(result).toBe(stats);
      // TODO: @JiaLiPassion need to wait for @types/jasmine update to handle optional parameters.
      // https://github.com/DefinitelyTyped/DefinitelyTyped/issues/43486
      expect(spy as any).toHaveBeenCalledWith(abcPath);
    });
  });
});

describe('NodeJSFileSystem', () => {
  let fs: NodeJSFileSystem;
  let abcPath: AbsoluteFsPath;
  let xyzPath: AbsoluteFsPath;

  beforeEach(() => {
    fs = new NodeJSFileSystem();
    abcPath = fs.resolve('/a/b/c');
    xyzPath = fs.resolve('/x/y/z');
  });

  describe('writeFile()', () => {
    it('should delegate to fs.writeFileSync()', () => {
      const spy = spyOn(realFs, 'writeFileSync');
      fs.writeFile(abcPath, 'Some contents');
      expect(spy).toHaveBeenCalledWith(abcPath, 'Some contents', undefined);
      spy.calls.reset();
      fs.writeFile(abcPath, 'Some contents', /* exclusive */ true);
      expect(spy).toHaveBeenCalledWith(abcPath, 'Some contents', {flag: 'wx'});
    });
  });

  describe('removeFile()', () => {
    it('should delegate to fs.unlink()', () => {
      const spy = spyOn(realFs, 'unlinkSync');
      fs.removeFile(abcPath);
      expect(spy).toHaveBeenCalledWith(abcPath);
    });
  });

  describe('copyFile()', () => {
    it('should delegate to fs.copyFileSync()', () => {
      const spy = spyOn(realFs, 'copyFileSync');
      fs.copyFile(abcPath, xyzPath);
      expect(spy).toHaveBeenCalledWith(abcPath, xyzPath);
    });
  });

  describe('moveFile()', () => {
    it('should delegate to fs.renameSync()', () => {
      const spy = spyOn(realFs, 'renameSync');
      fs.moveFile(abcPath, xyzPath);
      expect(spy).toHaveBeenCalledWith(abcPath, xyzPath);
    });
  });

  describe('ensureDir()', () => {
    it('should call exists() and fs.mkdir()', () => {
      const aPath = fs.resolve('/a');
      const abPath = fs.resolve('/a/b');
      const xPath = fs.resolve('/x');
      const xyPath = fs.resolve('/x/y');
      const mkdirCalls: string[] = [];
      const existsCalls: string[] = [];
      spyOn(realFs, 'mkdirSync').and.callFake(((path: string) => mkdirCalls.push(path)) as any);
      spyOn(fs, 'exists').and.callFake((path: AbsoluteFsPath) => {
        existsCalls.push(path);
        switch (path) {
          case aPath:
            return true;
          case abPath:
            return true;
          default:
            return false;
        }
      });
      fs.ensureDir(abcPath);
      expect(existsCalls).toEqual([abcPath, abPath]);
      expect(mkdirCalls).toEqual([abcPath]);

      mkdirCalls.length = 0;
      existsCalls.length = 0;

      fs.ensureDir(xyzPath);
      expect(existsCalls).toEqual([xyzPath, xyPath, xPath]);
      expect(mkdirCalls).toEqual([xPath, xyPath, xyzPath]);
    });

    it('should not fail if a directory (that did not exist before) does exist when trying to create it',
       () => {
         let abcPathExists = false;

         spyOn(fs, 'exists').and.callFake((path: AbsoluteFsPath) => {
           if (path === abcPath) {
             // Pretend `abcPath` is created (e.g. by another process) right after we check if it
             // exists for the first time.
             const exists = abcPathExists;
             abcPathExists = true;
             return exists;
           }
           return false;
         });
         spyOn(fs, 'stat').and.returnValue({isDirectory: () => true} as any);
         const mkdirSyncSpy =
             spyOn(realFs, 'mkdirSync').and.callFake(((path: string) => {
                                                       if (path === abcPath) {
                                                         throw new Error(
                                                             'It exists already. Supposedly.');
                                                       }
                                                     }) as any);

         fs.ensureDir(abcPath);
         expect(mkdirSyncSpy).toHaveBeenCalledTimes(3);
         expect(mkdirSyncSpy).toHaveBeenCalledWith(abcPath);
         expect(mkdirSyncSpy).toHaveBeenCalledWith(fs.dirname(abcPath));
       });

    it('should fail if creating the directory throws and the directory does not exist', () => {
      spyOn(fs, 'exists').and.returnValue(false);
      spyOn(realFs, 'mkdirSync')
          .and.callFake(((path: string) => {
                          if (path === abcPath) {
                            throw new Error('Unable to create directory (for whatever reason).');
                          }
                        }) as any);

      expect(() => fs.ensureDir(abcPath))
          .toThrowError('Unable to create directory (for whatever reason).');
    });

    it('should fail if creating the directory throws and the path points to a file', () => {
      const isDirectorySpy = jasmine.createSpy('isDirectory').and.returnValue(false);
      let abcPathExists = false;

      spyOn(fs, 'exists').and.callFake((path: AbsoluteFsPath) => {
        if (path === abcPath) {
          // Pretend `abcPath` is created (e.g. by another process) right after we check if it
          // exists for the first time.
          const exists = abcPathExists;
          abcPathExists = true;
          return exists;
        }
        return false;
      });
      spyOn(fs, 'stat').and.returnValue({isDirectory: isDirectorySpy} as any);
      spyOn(realFs, 'mkdirSync').and.callFake(((path: string) => {
                                                if (path === abcPath) {
                                                  throw new Error('It exists already. Supposedly.');
                                                }
                                              }) as any);

      expect(() => fs.ensureDir(abcPath)).toThrowError('It exists already. Supposedly.');
      expect(isDirectorySpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('removeDeep()', () => {
    it('should delegate to rmdirSync()', () => {
      const spy = spyOn(realFs, 'rmdirSync');
      fs.removeDeep(abcPath);
      expect(spy).toHaveBeenCalledWith(abcPath, {recursive: true});
    });
  });
});

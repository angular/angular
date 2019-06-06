/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as realFs from 'fs';
import {absoluteFrom, relativeFrom, setFileSystem} from '../src/helpers';
import {NodeJSFileSystem} from '../src/node_js_file_system';
import {AbsoluteFsPath} from '../src/types';

describe('NodeJSFileSystem', () => {
  let fs: NodeJSFileSystem;
  let abcPath: AbsoluteFsPath;
  let xyzPath: AbsoluteFsPath;

  beforeEach(() => {
    fs = new NodeJSFileSystem();
    // Set the file-system so that calls like `absoluteFrom()`
    // and `relativeFrom()` work correctly.
    setFileSystem(fs);
    abcPath = absoluteFrom('/a/b/c');
    xyzPath = absoluteFrom('/x/y/z');
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

  describe('writeFile()', () => {
    it('should delegate to fs.writeFileSync()', () => {
      const spy = spyOn(realFs, 'writeFileSync');
      fs.writeFile(abcPath, 'Some contents');
      expect(spy).toHaveBeenCalledWith(abcPath, 'Some contents', 'utf8');
    });
  });

  describe('readdir()', () => {
    it('should delegate to fs.readdirSync()', () => {
      const spy = spyOn(realFs, 'readdirSync').and.returnValue(['x', 'y/z']);
      const result = fs.readdir(abcPath);
      expect(result).toEqual([relativeFrom('x'), relativeFrom('y/z')]);
      expect(spy).toHaveBeenCalledWith(abcPath);
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
      expect(spy).toHaveBeenCalledWith(abcPath);
    });
  });

  describe('pwd()', () => {
    it('should delegate to process.cwd()', () => {
      const spy = spyOn(process, 'cwd').and.returnValue(abcPath);
      const result = fs.pwd();
      expect(result).toEqual(abcPath);
      expect(spy).toHaveBeenCalledWith();
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

  describe('mkdir()', () => {
    it('should delegate to fs.mkdirSync()', () => {
      const spy = spyOn(realFs, 'mkdirSync');
      fs.mkdir(xyzPath);
      expect(spy).toHaveBeenCalledWith(xyzPath);
    });
  });

  describe('ensureDir()', () => {
    it('should call exists() and fs.mkdir()', () => {
      const aPath = absoluteFrom('/a');
      const abPath = absoluteFrom('/a/b');
      const xPath = absoluteFrom('/x');
      const xyPath = absoluteFrom('/x/y');
      const mkdirCalls: string[] = [];
      const existsCalls: string[] = [];
      spyOn(realFs, 'mkdirSync').and.callFake((path: string) => mkdirCalls.push(path));
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
  });
});
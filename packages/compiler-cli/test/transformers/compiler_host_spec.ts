/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {CompilerHost, CompilerOptions} from '../../src/transformers/api';
import {createCompilerHost} from '../../src/transformers/compiler_host';
import {Directory, Entry, MockAotContext, MockCompilerHost} from '../mocks';

const dummyModule = 'export let foo: any[];';

describe('NgCompilerHost', () => {
  function createHost(
      {files = {}, options = {basePath: '/tmp'}}: {files?: Directory,
                                                   options?: CompilerOptions} = {}) {
    const context = new MockAotContext('/tmp/', files);
    const tsHost = new MockCompilerHost(context);
    return createCompilerHost({tsHost, options});
  }

  describe('fileNameToModuleName', () => {
    let ngHost: CompilerHost;
    beforeEach(() => { ngHost = createHost(); });

    it('should use a package import when accessing a package from a source file', () => {
      expect(ngHost.fileNameToModuleName('/tmp/node_modules/@angular/core.d.ts', '/tmp/main.ts'))
          .toBe('@angular/core');
    });

    it('should use a package import when accessing a package from another package', () => {
      expect(ngHost.fileNameToModuleName(
                 '/tmp/node_modules/mod1/index.d.ts', '/tmp/node_modules/mod2/index.d.ts'))
          .toBe('mod1/index');
      expect(ngHost.fileNameToModuleName(
                 '/tmp/node_modules/@angular/core/index.d.ts',
                 '/tmp/node_modules/@angular/common/index.d.ts'))
          .toBe('@angular/core/index');
    });

    it('should use a relative import when accessing a file in the same package', () => {
      expect(ngHost.fileNameToModuleName(
                 '/tmp/node_modules/mod/a/child.d.ts', '/tmp/node_modules/mod/index.d.ts'))
          .toBe('./a/child');
      expect(ngHost.fileNameToModuleName(
                 '/tmp/node_modules/@angular/core/src/core.d.ts',
                 '/tmp/node_modules/@angular/core/index.d.ts'))
          .toBe('./src/core');
    });

    it('should use a relative import when accessing a source file from a source file', () => {
      expect(ngHost.fileNameToModuleName('/tmp/src/a/child.ts', '/tmp/src/index.ts'))
          .toBe('./a/child');
    });

    it('should support multiple rootDirs when accessing a source file form a source file', () => {
      const ngHostWithMultipleRoots = createHost({
        options: {
          basePath: '/tmp/',
          rootDirs: [
            'src/a',
            'src/b',
          ]
        }
      });
      // both files are in the rootDirs
      expect(ngHostWithMultipleRoots.fileNameToModuleName('/tmp/src/b/b.ts', '/tmp/src/a/a.ts'))
          .toBe('./b');

      // one file is not in the rootDirs
      expect(ngHostWithMultipleRoots.fileNameToModuleName('/tmp/src/c/c.ts', '/tmp/src/a/a.ts'))
          .toBe('../c/c');
    });

    it('should error if accessing a source file from a package', () => {
      expect(
          () => ngHost.fileNameToModuleName(
              '/tmp/src/a/child.ts', '/tmp/node_modules/@angular/core.d.ts'))
          .toThrowError(
              'Trying to import a source file from a node_modules package: import /tmp/src/a/child.ts from /tmp/node_modules/@angular/core.d.ts');
    });

  });

  describe('moduleNameToFileName', () => {
    it('should resolve a package import without a containing file', () => {
      const ngHost = createHost(
          {files: {'tmp': {'node_modules': {'@angular': {'core': {'index.d.ts': dummyModule}}}}}});
      expect(ngHost.moduleNameToFileName('@angular/core'))
          .toBe('/tmp/node_modules/@angular/core/index.d.ts');
    });

    it('should resolve an import using the containing file', () => {
      const ngHost = createHost({files: {'tmp': {'src': {'a': {'child.d.ts': dummyModule}}}}});
      expect(ngHost.moduleNameToFileName('./a/child', '/tmp/src/index.ts'))
          .toBe('/tmp/src/a/child.d.ts');
    });
  });

  describe('resourceNameToFileName', () => {
    it('should resolve a relative import', () => {
      const ngHost = createHost({files: {'tmp': {'src': {'a': {'child.html': '<div>'}}}}});
      expect(ngHost.resourceNameToFileName('./a/child.html', '/tmp/src/index.ts'))
          .toBe('/tmp/src/a/child.html');

      expect(ngHost.resourceNameToFileName('./a/non-existing.html', '/tmp/src/index.ts'))
          .toBe(null);
    });

    it('should resolve package paths as relative paths', () => {
      const ngHost = createHost({files: {'tmp': {'src': {'a': {'child.html': '<div>'}}}}});
      expect(ngHost.resourceNameToFileName('a/child.html', '/tmp/src/index.ts'))
          .toBe('/tmp/src/a/child.html');
    });

    it('should resolve absolute paths', () => {
      const ngHost = createHost({files: {'tmp': {'src': {'a': {'child.html': '<div>'}}}}});
      expect(ngHost.resourceNameToFileName('/tmp/src/a/child.html', '/tmp/src/index.ts'))
          .toBe('/tmp/src/a/child.html');
    });
  });
});

import {
  AsyncTestCompleter,
  beforeEach,
  ddescribe,
  describe,
  el,
  expect,
  iit,
  inject,
  it,
  xit,
  TestComponentBuilder
} from 'angular2/testing_internal';

import {getImportModulePath, ImportEnv} from 'angular2/src/compiler/output/path_util';

export function main() {
  describe('PathUtils', () => {
    describe('getImportModulePath', () => {
      it('should calculate relative paths for JS and Dart', () => {
        expect(getImportModulePath('asset:somePkg/lib/modPath', 'asset:somePkg/lib/impPath',
                                   ImportEnv.JS))
            .toEqual('./impPath');
        expect(getImportModulePath('asset:somePkg/lib/modPath', 'asset:somePkg/lib/impPath',
                                   ImportEnv.Dart))
            .toEqual('impPath');
      });

      it('should calculate relative paths for different constellations', () => {
        expect(getImportModulePath('asset:somePkg/test/modPath', 'asset:somePkg/test/impPath',
                                   ImportEnv.JS))
            .toEqual('./impPath');
        expect(getImportModulePath('asset:somePkg/lib/modPath', 'asset:somePkg/lib/dir2/impPath',
                                   ImportEnv.JS))
            .toEqual('./dir2/impPath');
        expect(getImportModulePath('asset:somePkg/lib/dir1/modPath', 'asset:somePkg/lib/impPath',
                                   ImportEnv.JS))
            .toEqual('../impPath');
        expect(getImportModulePath('asset:somePkg/lib/dir1/modPath',
                                   'asset:somePkg/lib/dir2/impPath', ImportEnv.JS))
            .toEqual('../dir2/impPath');
      });

      it('should calculate absolute paths for JS and Dart', () => {
        expect(getImportModulePath('asset:somePkg/lib/modPath', 'asset:someOtherPkg/lib/impPath',
                                   ImportEnv.JS))
            .toEqual('someOtherPkg/impPath');
        expect(getImportModulePath('asset:somePkg/lib/modPath', 'asset:someOtherPkg/lib/impPath',
                                   ImportEnv.Dart))
            .toEqual('package:someOtherPkg/impPath');
      });

      it('should not allow absolute imports of non lib modules', () => {
        expect(() => getImportModulePath('asset:somePkg/lib/modPath', 'asset:somePkg/test/impPath',
                                         ImportEnv.Dart))
            .toThrowError(
                `Can't import url asset:somePkg/test/impPath from asset:somePkg/lib/modPath`);
      });

      it('should not allow non asset urls as base url', () => {
        expect(() => getImportModulePath('http:somePkg/lib/modPath', 'asset:somePkg/test/impPath',
                                         ImportEnv.Dart))
            .toThrowError(`Url http:somePkg/lib/modPath is not a valid asset: url`);
      });

      it('should allow non asset urls as import urls and pass them through', () => {
        expect(getImportModulePath('asset:somePkg/lib/modPath', 'dart:html', ImportEnv.Dart))
            .toEqual('dart:html');
      });
    });
  });
}
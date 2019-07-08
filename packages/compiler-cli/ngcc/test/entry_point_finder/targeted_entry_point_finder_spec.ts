/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AbsoluteFsPath, FileSystem, absoluteFrom, getFileSystem, relative} from '../../../src/ngtsc/file_system';
import {TestFile, runInEachFileSystem} from '../../../src/ngtsc/file_system/testing';
import {loadTestFiles} from '../../../test/helpers';
import {DependencyResolver} from '../../src/dependencies/dependency_resolver';
import {EsmDependencyHost} from '../../src/dependencies/esm_dependency_host';
import {ModuleResolver} from '../../src/dependencies/module_resolver';
import {TargetedEntryPointFinder} from '../../src/entry_point_finder/targeted_entry_point_finder';
import {NgccConfiguration} from '../../src/packages/configuration';
import {EntryPoint} from '../../src/packages/entry_point';
import {PathMappings} from '../../src/utils';
import {MockLogger} from '../helpers/mock_logger';

runInEachFileSystem(() => {
  describe('TargetedEntryPointFinder', () => {
    let fs: FileSystem;
    let resolver: DependencyResolver;
    let logger: MockLogger;
    let config: NgccConfiguration;
    let _Abs: typeof absoluteFrom;

    beforeEach(() => {
      fs = getFileSystem();
      _Abs = absoluteFrom;
      logger = new MockLogger();
      resolver = new DependencyResolver(
          fs, logger, {esm2015: new EsmDependencyHost(fs, new ModuleResolver(fs))});
      config = new NgccConfiguration(fs, _Abs('/'));
    });

    describe('findEntryPoints()', () => {
      it('should find a single entry-point with no dependencies', () => {
        const basePath = _Abs('/sub_entry_points/node_modules');
        const targetPath = _Abs('/sub_entry_points/node_modules/common');
        loadTestFiles([
          ...createPackage(fs.resolve(basePath, ''), 'common'),
          ...createPackage(fs.resolve(basePath, 'common'), 'http', ['@angular/common']),
          ...createPackage(
              fs.resolve(basePath, 'common/http'), 'testing',
              ['@angular/common/http', '@angular/common/testing']),
          ...createPackage(fs.resolve(basePath, 'common'), 'testing', ['@angular/common']),
        ]);
        const finder = new TargetedEntryPointFinder(
            fs, config, logger, resolver, _Abs('/sub_entry_points/node_modules'), targetPath,
            undefined);
        const {entryPoints} = finder.findEntryPoints();
        expect(dumpEntryPointPaths(basePath, entryPoints)).toEqual([
          ['common', 'common'],
        ]);
      });

      it('should find dependencies of secondary entry-points within a package', () => {
        const basePath = _Abs('/sub_entry_points/node_modules');
        const targetPath = _Abs('/sub_entry_points/node_modules/common/http/testing');
        loadTestFiles([
          ...createPackage(fs.resolve(basePath, ''), 'common'),
          ...createPackage(fs.resolve(basePath, 'common'), 'http', ['common']),
          ...createPackage(
              fs.resolve(basePath, 'common/http'), 'testing', ['common/http', 'common/testing']),
          ...createPackage(fs.resolve(basePath, 'common'), 'testing', ['common']),
        ]);
        const finder = new TargetedEntryPointFinder(
            fs, config, logger, resolver, _Abs('/sub_entry_points/node_modules'), targetPath,
            undefined);
        const {entryPoints} = finder.findEntryPoints();
        expect(dumpEntryPointPaths(basePath, entryPoints)).toEqual([
          ['common', 'common'],
          ['common', 'common/http'],
          ['common', 'common/testing'],
          ['common', 'common/http/testing'],
        ]);
      });

      it('should find dependencies inside a namespace', () => {
        const basePath = _Abs('/namespaced/node_modules');
        const targetPath = _Abs('/namespaced/node_modules/@angular/common/http');
        loadTestFiles([
          ...createPackage(fs.resolve(basePath, '@angular'), 'common'),
          ...createPackage(fs.resolve(basePath, '@angular/common'), 'http', ['@angular/common']),
          ...createPackage(
              fs.resolve(basePath, '@angular/common/http'), 'testing',
              ['@angular/common/http', '@angular/common/testing']),
          ...createPackage(fs.resolve(basePath, '@angular/common'), 'testing', ['@angular/common']),
        ]);
        const finder = new TargetedEntryPointFinder(
            fs, config, logger, resolver, _Abs('/namespaced/node_modules'), targetPath, undefined);
        const {entryPoints} = finder.findEntryPoints();
        expect(dumpEntryPointPaths(basePath, entryPoints)).toEqual([
          ['@angular/common', '@angular/common'],
          ['@angular/common', '@angular/common/http'],
        ]);
      });

      it('should return an empty array if the target path is not an entry-point', () => {
        const targetPath = _Abs('/no_packages/node_modules/should_not_be_found');
        fs.ensureDir(_Abs('/no_packages/node_modules/should_not_be_found'));
        const finder = new TargetedEntryPointFinder(
            fs, config, logger, resolver, _Abs('/no_packages/node_modules'), targetPath, undefined);
        const {entryPoints} = finder.findEntryPoints();
        expect(entryPoints).toEqual([]);
      });

      it('should return an empty array if the target path is not an Angular entry-point', () => {
        const targetPath = _Abs('/no_valid_entry_points/node_modules/some_package');
        loadTestFiles([
          {
            name: _Abs('/no_valid_entry_points/node_modules/some_package/package.json'),
            contents: '{}'
          },
        ]);
        const finder = new TargetedEntryPointFinder(
            fs, config, logger, resolver, _Abs('/no_valid_entry_points/node_modules'), targetPath,
            undefined);
        const {entryPoints} = finder.findEntryPoints();
        expect(entryPoints).toEqual([]);
      });

      it('should handle nested node_modules folders', () => {
        const targetPath = _Abs('/nested_node_modules/node_modules/outer');
        loadTestFiles([
          ...createPackage(_Abs('/nested_node_modules/node_modules'), 'outer', ['inner']),
          ...createPackage(_Abs('/nested_node_modules/node_modules/outer/node_modules'), 'inner'),
        ]);
        const finder = new TargetedEntryPointFinder(
            fs, config, logger, resolver, _Abs('/nested_node_modules/node_modules'), targetPath,
            undefined);
        const {entryPoints} = finder.findEntryPoints();
        expect(dumpEntryPointPaths(_Abs('/nested_node_modules/node_modules'), entryPoints))
            .toEqual([
              ['outer/node_modules/inner', 'outer/node_modules/inner'],
              ['outer', 'outer'],
            ]);
      });

      it('should handle dependencies via pathMappings', () => {
        const basePath = _Abs('/path_mapped/node_modules');
        const targetPath = _Abs('/path_mapped/node_modules/test');
        const pathMappings: PathMappings = {
          baseUrl: '/path_mapped/dist',
          paths: {
            '@x/*': ['*'],
            '@y/*/test': ['lib/*/test'],
            '@z/*': ['../dist/moo/../*'],
          }
        };
        loadTestFiles([
          ...createPackage(
              _Abs('/path_mapped/node_modules'), 'test',
              ['pkg1', '@x/pkg2', '@y/pkg3/test', '@z/pkg5']),
          ...createPackage(_Abs('/path_mapped/node_modules'), 'pkg1'),
          ...createPackage(_Abs('/path_mapped/dist'), 'pkg2', ['pkg4']),
          ...createPackage(_Abs('/path_mapped/dist/pkg2/node_modules'), 'pkg4'),
          ...createPackage(_Abs('/path_mapped/dist/lib/pkg3'), 'test'),
          ...createPackage(_Abs('/path_mapped/dist'), 'pkg5'),
        ]);
        resolver = new DependencyResolver(
            fs, logger, {esm2015: new EsmDependencyHost(fs, new ModuleResolver(fs, pathMappings))});
        const finder = new TargetedEntryPointFinder(
            fs, config, logger, resolver, basePath, targetPath, pathMappings);
        const {entryPoints} = finder.findEntryPoints();
        expect(dumpEntryPointPaths(basePath, entryPoints)).toEqual([
          ['pkg1', 'pkg1'],
          ['../dist/pkg2/node_modules/pkg4', '../dist/pkg2/node_modules/pkg4'],
          ['../dist/pkg2', '../dist/pkg2'],
          ['../dist/lib/pkg3/test', '../dist/lib/pkg3/test'],
          ['../dist/pkg5', '../dist/pkg5'],
          ['test', 'test'],
        ]);
      });

      it('should handle pathMappings that map to files or non-existent directories', () => {
        const basePath = _Abs('/path_mapped/node_modules');
        const targetPath = _Abs('/path_mapped/node_modules/test');
        const pathMappings: PathMappings = {
          baseUrl: '/path_mapped/dist',
          paths: {
            '@test': ['pkg2/fesm2015/pkg2.js'],
            '@missing': ['pkg3'],
          }
        };
        loadTestFiles([
          ...createPackage(_Abs('/path_mapped/node_modules'), 'test', []),
          ...createPackage(_Abs('/path_mapped/dist'), 'pkg2'),
        ]);
        resolver = new DependencyResolver(
            fs, logger, {esm2015: new EsmDependencyHost(fs, new ModuleResolver(fs, pathMappings))});
        const finder = new TargetedEntryPointFinder(
            fs, config, logger, resolver, basePath, targetPath, pathMappings);
        const {entryPoints} = finder.findEntryPoints();
        expect(dumpEntryPointPaths(basePath, entryPoints)).toEqual([
          ['test', 'test'],
        ]);
      });

      function createPackage(
          basePath: AbsoluteFsPath, packageName: string, deps: string[] = []): TestFile[] {
        return [
          {
            name: _Abs(`${basePath}/${packageName}/package.json`),
            contents: JSON.stringify({
              typings: `./${packageName}.d.ts`,
              fesm2015: `./fesm2015/${packageName}.js`,
            })
          },
          {
            name: _Abs(`${basePath}/${packageName}/${packageName}.metadata.json`),
            contents: 'metadata info'
          },
          {
            name: _Abs(`${basePath}/${packageName}/fesm2015/${packageName}.js`),
            contents: deps.map((dep, i) => `import * as i${i} from '${dep}';`).join('\n'),
          },
        ];
      }

      function dumpEntryPointPaths(
          basePath: AbsoluteFsPath, entryPoints: EntryPoint[]): [string, string][] {
        return entryPoints.map(x => [relative(basePath, x.package), relative(basePath, x.path)]);
      }

    });
  });
});
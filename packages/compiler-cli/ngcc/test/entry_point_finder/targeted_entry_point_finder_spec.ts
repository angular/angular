/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {absoluteFrom, AbsoluteFsPath, FileSystem, getFileSystem} from '../../../src/ngtsc/file_system';
import {runInEachFileSystem, TestFile} from '../../../src/ngtsc/file_system/testing';
import {MockLogger} from '../../../src/ngtsc/logging/testing';
import {loadTestFiles} from '../../../src/ngtsc/testing';
import {DependencyResolver} from '../../src/dependencies/dependency_resolver';
import {DtsDependencyHost} from '../../src/dependencies/dts_dependency_host';
import {EsmDependencyHost} from '../../src/dependencies/esm_dependency_host';
import {ModuleResolver} from '../../src/dependencies/module_resolver';
import {TargetedEntryPointFinder} from '../../src/entry_point_finder/targeted_entry_point_finder';
import {NGCC_VERSION} from '../../src/packages/build_marker';
import {NgccConfiguration, ProcessedNgccPackageConfig} from '../../src/packages/configuration';
import {EntryPoint, EntryPointPackageJson} from '../../src/packages/entry_point';
import {PathMappings} from '../../src/path_mappings';

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
      const srcHost = new EsmDependencyHost(fs, new ModuleResolver(fs));
      const dtsHost = new DtsDependencyHost(fs);
      config = new NgccConfiguration(fs, _Abs('/'));
      resolver = new DependencyResolver(fs, logger, config, {esm2015: srcHost}, dtsHost);
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
            fs, config, logger, resolver, _Abs('/sub_entry_points/node_modules'), undefined,
            targetPath);
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
            fs, config, logger, resolver, _Abs('/sub_entry_points/node_modules'), undefined,
            targetPath);
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
            fs, config, logger, resolver, _Abs('/namespaced/node_modules'), undefined, targetPath);
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
            fs, config, logger, resolver, _Abs('/no_packages/node_modules'), undefined, targetPath);
        const {entryPoints} = finder.findEntryPoints();
        expect(entryPoints).toEqual([]);
      });

      it('should return an empty array if the target path is an ignored entry-point', () => {
        const basePath = _Abs('/project/node_modules');
        const targetPath = _Abs('/project/node_modules/some-package');
        const finder = new TargetedEntryPointFinder(
            fs, config, logger, resolver, basePath, undefined, targetPath);

        loadTestFiles(createPackage(basePath, 'some-package'));
        spyOn(config, 'getPackageConfig')
            .and.returnValue(
                new ProcessedNgccPackageConfig(fs, _Abs('/project/node_modules/some-package'), {
                  entryPoints: {
                    '.': {ignore: true},
                  },
                }));

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
            fs, config, logger, resolver, _Abs('/no_valid_entry_points/node_modules'), undefined,
            targetPath);
        const {entryPoints} = finder.findEntryPoints();
        expect(entryPoints).toEqual([]);
      });

      // https://github.com/angular/angular/issues/32302
      it('should return an empty array if the target path is not an Angular entry-point with typings',
         () => {
           const targetPath = _Abs('/no_valid_entry_points/node_modules/some_package');
           loadTestFiles([
             {
               name: _Abs('/no_valid_entry_points/node_modules/some_package/package.json'),
               contents: '{"typings": "./index.d.ts"}'
             },
             {
               name: _Abs('/no_valid_entry_points/node_modules/some_package/index.d.ts'),
               contents: 'export declare class MyClass {}'
             },
             {
               name: _Abs('/no_valid_entry_points/node_modules/some_package/index.js'),
               contents: 'export class MyClass {}'
             },
           ]);
           const finder = new TargetedEntryPointFinder(
               fs, config, logger, resolver, _Abs('/no_valid_entry_points/node_modules'), undefined,
               targetPath);
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
            fs, config, logger, resolver, _Abs('/nested_node_modules/node_modules'), undefined,
            targetPath);
        const {entryPoints} = finder.findEntryPoints();
        expect(dumpEntryPointPaths(_Abs('/nested_node_modules/node_modules'), entryPoints))
            .toEqual([
              ['outer/node_modules/inner', 'outer/node_modules/inner'],
              ['outer', 'outer'],
            ]);
      });

      it('should handle external node_modules folders (e.g. in a yarn workspace)', () => {
        // Note that neither the basePath and targetPath contain each other
        const basePath = _Abs('/nested_node_modules/packages/app/node_modules');
        const targetPath = _Abs('/nested_node_modules/node_modules/package/entry-point');
        loadTestFiles([
          ...createPackage(_Abs('/nested_node_modules/node_modules'), 'package'),
          ...createPackage(_Abs('/nested_node_modules/node_modules/package'), 'entry-point'),
        ]);
        const finder = new TargetedEntryPointFinder(
            fs, config, logger, resolver, basePath, undefined, targetPath);
        const {entryPoints} = finder.findEntryPoints();
        expect(dumpEntryPointPaths(_Abs('/nested_node_modules'), entryPoints)).toEqual([
          ['node_modules/package', 'node_modules/package/entry-point'],
        ]);
      });

      it('should handle external node_modules folders (e.g. in a yarn workspace) for dependencies',
         () => {
           // The application being compiled is at `/project/packages/app` so the basePath sent to
           // ngcc is the `node_modules` below it
           const basePath = _Abs('/project/packages/app/node_modules');
           // `packages/app` depends upon lib1, which has a private dependency on lib2 in its
           // own `node_modules` folder
           const lib2 = createPackage(
               _Abs('/project/node_modules/lib1/node_modules'), 'lib2', ['lib3/entry-point']);
           // `lib2` depends upon `lib3/entry-point` which has been hoisted all the way up to the
           // top level `node_modules`
           const lib3 = createPackage(_Abs('/project/node_modules'), 'lib3');
           const lib3EntryPoint = createPackage(_Abs('/project/node_modules/lib3'), 'entry-point');
           loadTestFiles([...lib2, ...lib3, ...lib3EntryPoint]);
           // The targetPath being processed is `lib2` and we expect it to find the correct
           // entry-point info for the `lib3/entry-point` dependency.
           const targetPath = _Abs('/project/node_modules/lib1/node_modules/lib2');
           const finder = new TargetedEntryPointFinder(
               fs, config, logger, resolver, basePath, undefined, targetPath);
           const {entryPoints} = finder.findEntryPoints();
           expect(dumpEntryPointPaths(_Abs('/project/node_modules'), entryPoints)).toEqual([
             ['lib3', 'lib3/entry-point'],
             ['lib1/node_modules/lib2', 'lib1/node_modules/lib2'],
           ]);
         });

      it('should handle external node_modules folders (e.g. in a yarn workspace) for scoped dependencies',
         () => {
           // The application being compiled is at `/project/packages/app` so the basePath sent to
           // ngcc is the `node_modules` below it
           const basePath = _Abs('/project/packages/app/node_modules');
           // `packages/app` depends upon lib1, which has a private dependency on lib2 in its
           // own `node_modules` folder
           const lib2 = createPackage(
               _Abs('/project/node_modules/lib1/node_modules'), 'lib2',
               ['@scope/lib3/entry-point']);
           // `lib2` depends upon `lib3/entry-point` which has been hoisted all the way up to the
           // top level `node_modules`
           const lib3 = createPackage(_Abs('/project/node_modules/@scope'), 'lib3');
           const lib3EntryPoint = createPackage(
               _Abs('/project/node_modules/@scope/lib3'), 'entry-point', ['lib4/entry-point']);
           const lib4 =
               createPackage(_Abs('/project/node_modules/@scope/lib3/node_modules'), 'lib4');
           const lib4EntryPoint = createPackage(
               _Abs('/project/node_modules/@scope/lib3/node_modules/lib4'), 'entry-point');
           loadTestFiles([...lib2, ...lib3, ...lib3EntryPoint, ...lib4, ...lib4EntryPoint]);
           // The targetPath being processed is `lib2` and we expect it to find the correct
           // entry-point info for the `lib3/entry-point` dependency.
           const targetPath = _Abs('/project/node_modules/lib1/node_modules/lib2');
           const finder = new TargetedEntryPointFinder(
               fs, config, logger, resolver, basePath, undefined, targetPath);
           const {entryPoints} = finder.findEntryPoints();
           expect(dumpEntryPointPaths(_Abs('/project/node_modules'), entryPoints)).toEqual([
             ['@scope/lib3/node_modules/lib4', '@scope/lib3/node_modules/lib4/entry-point'],
             ['@scope/lib3', '@scope/lib3/entry-point'],
             ['lib1/node_modules/lib2', 'lib1/node_modules/lib2'],
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
        const srcHost = new EsmDependencyHost(fs, new ModuleResolver(fs, pathMappings));
        const dtsHost = new DtsDependencyHost(fs, pathMappings);
        resolver = new DependencyResolver(fs, logger, config, {esm2015: srcHost}, dtsHost);
        const finder = new TargetedEntryPointFinder(
            fs, config, logger, resolver, basePath, pathMappings, targetPath);
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

      it('should correctly compute the packagePath of secondary entry-points via pathMappings',
         () => {
           const basePath = _Abs('/path_mapped/node_modules');
           const targetPath = _Abs('/path_mapped/dist/primary/secondary');
           const pathMappings: PathMappings = {
             baseUrl: '/path_mapped/dist',
             paths: {'libs': ['primary'], 'extras': ['primary/*']}
           };
           loadTestFiles([
             ...createPackage(_Abs('/path_mapped/dist'), 'primary'),
             ...createPackage(_Abs('/path_mapped/dist/primary'), 'secondary'),
           ]);
           const srcHost = new EsmDependencyHost(fs, new ModuleResolver(fs, pathMappings));
           const dtsHost = new DtsDependencyHost(fs, pathMappings);
           resolver = new DependencyResolver(fs, logger, config, {esm2015: srcHost}, dtsHost);
           const finder = new TargetedEntryPointFinder(
               fs, config, logger, resolver, basePath, pathMappings, targetPath);
           const {entryPoints} = finder.findEntryPoints();
           expect(entryPoints.length).toEqual(1);
           const entryPoint = entryPoints[0];
           expect(entryPoint.name).toEqual('secondary');
           expect(entryPoint.path).toEqual(_Abs('/path_mapped/dist/primary/secondary'));
           expect(entryPoint.packagePath).toEqual(_Abs('/path_mapped/dist/primary'));
         });

      it('should correctly compute an entry-point whose path starts with the same string as another entry-point, via pathMappings',
         () => {
           const basePath = _Abs('/path_mapped/node_modules');
           const targetPath = _Abs('/path_mapped/node_modules/test');
           const pathMappings: PathMappings = {
             baseUrl: '/path_mapped/dist',
             paths: {
               'lib1': ['my-lib/my-lib', 'my-lib'],
               'lib2': ['my-lib/a', 'my-lib/a'],
               'lib3': ['my-lib/b', 'my-lib/b'],
               'lib4': ['my-lib-other/my-lib-other', 'my-lib-other']
             }
           };
           loadTestFiles([
             ...createPackage(_Abs('/path_mapped/node_modules'), 'test', ['lib2', 'lib4']),
             ...createPackage(_Abs('/path_mapped/dist/my-lib'), 'my-lib'),
             ...createPackage(_Abs('/path_mapped/dist/my-lib'), 'a'),
             ...createPackage(_Abs('/path_mapped/dist/my-lib'), 'b'),
             ...createPackage(_Abs('/path_mapped/dist/my-lib-other'), 'my-lib-other'),
           ]);
           const srcHost = new EsmDependencyHost(fs, new ModuleResolver(fs, pathMappings));
           const dtsHost = new DtsDependencyHost(fs, pathMappings);
           resolver = new DependencyResolver(fs, logger, config, {esm2015: srcHost}, dtsHost);
           const finder = new TargetedEntryPointFinder(
               fs, config, logger, resolver, basePath, pathMappings, targetPath);
           const {entryPoints} = finder.findEntryPoints();
           expect(dumpEntryPointPaths(basePath, entryPoints)).toEqual([
             ['../dist/my-lib/a', '../dist/my-lib/a'],
             ['../dist/my-lib-other/my-lib-other', '../dist/my-lib-other/my-lib-other'],
             ['test', 'test'],
           ]);
         });

      it('should correctly compute the package path for a target whose name contains the string of another package',
         () => {
           // Create the "my-lib" package - it doesn't need to be a real entry-point
           const myLibPath = _Abs('/project/dist/my-lib');
           loadTestFiles([{
             name: fs.resolve(myLibPath, 'package.json'),
             contents: JSON.stringify({name: 'my-lib'})
           }]);

           // Create the "my-lib-other" Angular entry-point
           const myLibOtherPath = _Abs('/project/dist/my-lib-other');
           loadTestFiles([
             {
               name: fs.resolve(myLibOtherPath, 'package.json'),
               contents: JSON.stringify({
                 name: `my-lib-other`,
                 typings: `./my-lib-other.d.ts`,
                 fesm2015: `./fesm2015/my-lib-other.js`,
                 esm5: `./esm5/my-lib-other.js`,
                 main: `./common/my-lib-other.js`,
               })
             },
             {name: fs.resolve(myLibOtherPath, 'my-lib-other.metadata.json'), contents: 'metadata'},
             {name: fs.resolve(myLibOtherPath, 'my-lib-other.d.ts'), contents: 'typings'},
             {name: fs.resolve(myLibOtherPath, 'fesm2015/my-lib-other.js'), contents: ''},
             {name: fs.resolve(myLibOtherPath, 'esm5/my-lib-other.js'), contents: ''},
             {name: fs.resolve(myLibOtherPath, 'commonjs/my-lib-other.js'), contents: ''},
           ]);

           const basePath = _Abs('/project/node_modules');
           const pathMappings: PathMappings = {
             baseUrl: '/project',
             paths: {
               'lib1': ['dist/my-lib'],
               'lib2': ['dist/my-lib-other'],
             }
           };

           const srcHost = new EsmDependencyHost(fs, new ModuleResolver(fs, pathMappings));
           const dtsHost = new DtsDependencyHost(fs, pathMappings);
           resolver = new DependencyResolver(fs, logger, config, {esm2015: srcHost}, dtsHost);
           const finder = new TargetedEntryPointFinder(
               fs, config, logger, resolver, basePath, pathMappings, myLibOtherPath);
           const {entryPoints} = finder.findEntryPoints();

           expect(dumpEntryPointPaths(basePath, entryPoints)).toEqual([
             ['../dist/my-lib-other', '../dist/my-lib-other'],
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
        const srcHost = new EsmDependencyHost(fs, new ModuleResolver(fs, pathMappings));
        const dtsHost = new DtsDependencyHost(fs, pathMappings);
        resolver = new DependencyResolver(fs, logger, config, {esm2015: srcHost}, dtsHost);
        const finder = new TargetedEntryPointFinder(
            fs, config, logger, resolver, basePath, pathMappings, targetPath);
        const {entryPoints} = finder.findEntryPoints();
        expect(dumpEntryPointPaths(basePath, entryPoints)).toEqual([
          ['test', 'test'],
        ]);
      });

      function dumpEntryPointPaths(
          basePath: AbsoluteFsPath, entryPoints: EntryPoint[]): [string, string][] {
        return entryPoints.map(
            x => [fs.relative(basePath, x.packagePath), fs.relative(basePath, x.path)]);
      }
    });

    describe('targetNeedsProcessingOrCleaning()', () => {
      it('should return false if there is no entry-point', () => {
        const targetPath = _Abs('/no_packages/node_modules/should_not_be_found');
        fs.ensureDir(targetPath);
        const finder = new TargetedEntryPointFinder(
            fs, config, logger, resolver, _Abs('/no_packages/node_modules'), undefined, targetPath);
        expect(finder.targetNeedsProcessingOrCleaning(['fesm2015'], true)).toBe(false);
      });

      it('should return false if the target path is not a valid entry-point', () => {
        const targetPath = _Abs('/no_valid_entry_points/node_modules/some_package');
        loadTestFiles([
          {
            name: _Abs('/no_valid_entry_points/node_modules/some_package/package.json'),
            contents: '{}'
          },
        ]);
        const finder = new TargetedEntryPointFinder(
            fs, config, logger, resolver, _Abs('/no_valid_entry_points/node_modules'), undefined,
            targetPath);
        expect(finder.targetNeedsProcessingOrCleaning(['fesm2015'], true)).toBe(false);
      });

      it('should return false if the target path is ignored by the config', () => {
        const basePath = _Abs('/project/node_modules');
        const targetPath = _Abs('/project/node_modules/some-package');
        const finder = new TargetedEntryPointFinder(
            fs, config, logger, resolver, basePath, undefined, targetPath);

        loadTestFiles(createPackage(basePath, 'some-package'));
        spyOn(config, 'getPackageConfig')
            .and.returnValue(
                new ProcessedNgccPackageConfig(fs, _Abs('/project/node_modules/some-package'), {
                  entryPoints: {
                    '.': {ignore: true},
                  },
                }));

        expect(finder.targetNeedsProcessingOrCleaning(['fesm2015'], true)).toBe(false);
      });

      it('should false if the target path has no typings', () => {
        const targetPath = _Abs('/no_valid_entry_points/node_modules/some_package');
        loadTestFiles([
          {
            name: _Abs('/no_valid_entry_points/node_modules/some_package/package.json'),
            contents: '{"fesm2015": "./index.js"}'
          },
          {
            name:
                _Abs('/no_valid_entry_points/node_modules/some_package/some_package.metadata.json'),
            contents: 'metadata info'
          },
          {
            name: _Abs('/no_valid_entry_points/node_modules/some_package/index.js'),
            contents: 'export class MyClass {}'
          },
        ]);
        const finder = new TargetedEntryPointFinder(
            fs, config, logger, resolver, _Abs('/no_valid_entry_points/node_modules'), undefined,
            targetPath);
        expect(finder.targetNeedsProcessingOrCleaning(['fesm2015'], true)).toBe(false);
      });

      it('should false if the target path is not compiled by Angular - i.e has no metadata file',
         () => {
           const targetPath = _Abs('/no_valid_entry_points/node_modules/some_package');
           loadTestFiles([
             {
               name: _Abs('/no_valid_entry_points/node_modules/some_package/package.json'),
               contents: '{"typings": "./index.d.ts", "fesm2015": "./index.js"}'
             },
             {
               name: _Abs('/no_valid_entry_points/node_modules/some_package/index.d.ts'),
               contents: 'export declare class MyClass {}'
             },
             {
               name: _Abs('/no_valid_entry_points/node_modules/some_package/index.js'),
               contents: 'export class MyClass {}'
             },
           ]);
           const finder = new TargetedEntryPointFinder(
               fs, config, logger, resolver, _Abs('/no_valid_entry_points/node_modules'), undefined,
               targetPath);
           expect(finder.targetNeedsProcessingOrCleaning(['fesm2015'], true)).toBe(false);
         });

      describe('[compileAllFormats: true]', () => {
        it('should return true if none of the properties to consider have been processed', () => {
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
              fs, config, logger, resolver, basePath, undefined, targetPath);
          expect(finder.targetNeedsProcessingOrCleaning(['fesm2015', 'esm5'], true)).toBe(true);
        });

        it('should return true if at least one of the properties to consider has not been processed',
           () => {
             const basePath = _Abs('/sub_entry_points/node_modules');
             const targetPath = _Abs('/sub_entry_points/node_modules/common/http/testing');
             loadTestFiles([
               ...createPackage(fs.resolve(basePath, ''), 'common'),
               ...createPackage(fs.resolve(basePath, 'common'), 'http', ['common']),
               ...createPackage(
                   fs.resolve(basePath, 'common/http'), 'testing',
                   ['common/http', 'common/testing']),
               ...createPackage(fs.resolve(basePath, 'common'), 'testing', ['common']),
             ]);

             // Add a build marker to the package.json
             const packageJsonPath = _Abs(`${targetPath}/package.json`);
             const packageJson = JSON.parse(fs.readFile(packageJsonPath)) as EntryPointPackageJson;
             packageJson.__processed_by_ivy_ngcc__ = {
               esm5: NGCC_VERSION,
             };
             fs.writeFile(packageJsonPath, JSON.stringify(packageJson));

             const finder = new TargetedEntryPointFinder(
                 fs, config, logger, resolver, basePath, undefined, targetPath);
             expect(finder.targetNeedsProcessingOrCleaning(['fesm2015', 'esm5'], true)).toBe(true);
           });

        it('should return false if all of the properties to consider have been processed', () => {
          const basePath = _Abs('/sub_entry_points/node_modules');
          const targetPath = _Abs('/sub_entry_points/node_modules/common/http/testing');
          loadTestFiles([
            ...createPackage(fs.resolve(basePath, ''), 'common'),
            ...createPackage(fs.resolve(basePath, 'common'), 'http', ['common']),
            ...createPackage(
                fs.resolve(basePath, 'common/http'), 'testing', ['common/http', 'common/testing']),
            ...createPackage(fs.resolve(basePath, 'common'), 'testing', ['common']),
          ]);

          // Add build markers to the package.json
          const packageJsonPath = _Abs(`${targetPath}/package.json`);
          const packageJson = JSON.parse(fs.readFile(packageJsonPath)) as EntryPointPackageJson;
          packageJson.__processed_by_ivy_ngcc__ = {
            fesm2015: NGCC_VERSION,
            esm5: NGCC_VERSION,
            main: NGCC_VERSION,
          };
          fs.writeFile(packageJsonPath, JSON.stringify(packageJson));

          const finder = new TargetedEntryPointFinder(
              fs, config, logger, resolver, basePath, undefined, targetPath);
          expect(finder.targetNeedsProcessingOrCleaning(['fesm2015', 'esm5'], true)).toBe(false);
        });
      });

      describe('[compileAllFormats: false]', () => {
        it('should return true if none of the properties to consider have been processed', () => {
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
              fs, config, logger, resolver, basePath, undefined, targetPath);
          expect(finder.targetNeedsProcessingOrCleaning(['fesm2015', 'esm5'], false)).toBe(true);
        });

        it('should return true if the first of the properties to consider that is in the package.json has not been processed',
           () => {
             const basePath = _Abs('/sub_entry_points/node_modules');
             const targetPath = _Abs('/sub_entry_points/node_modules/common/http/testing');
             loadTestFiles([
               ...createPackage(fs.resolve(basePath, ''), 'common'),
               ...createPackage(fs.resolve(basePath, 'common'), 'http', ['common']),
               ...createPackage(
                   fs.resolve(basePath, 'common/http'), 'testing',
                   ['common/http', 'common/testing']),
               ...createPackage(fs.resolve(basePath, 'common'), 'testing', ['common']),
             ]);

             // Add build markers to the package.json
             const packageJsonPath = _Abs(`${targetPath}/package.json`);
             const packageJson = JSON.parse(fs.readFile(packageJsonPath)) as EntryPointPackageJson;
             packageJson.__processed_by_ivy_ngcc__ = {
               esm5: NGCC_VERSION,
             };
             fs.writeFile(packageJsonPath, JSON.stringify(packageJson));

             const finder = new TargetedEntryPointFinder(
                 fs, config, logger, resolver, basePath, undefined, targetPath);
             expect(finder.targetNeedsProcessingOrCleaning(['fesm2015', 'esm5'], false)).toBe(true);
           });

        it('should return false if the first of the properties to consider (that actually appear in the package.json) has been processed',
           () => {
             const basePath = _Abs('/sub_entry_points/node_modules');
             const targetPath = _Abs('/sub_entry_points/node_modules/common/http/testing');
             loadTestFiles([
               ...createPackage(fs.resolve(basePath, ''), 'common'),
               ...createPackage(fs.resolve(basePath, 'common'), 'http', ['common']),
               ...createPackage(
                   fs.resolve(basePath, 'common/http'), 'testing',
                   ['common/http', 'common/testing']),
               ...createPackage(fs.resolve(basePath, 'common'), 'testing', ['common']),
             ]);

             // Add build markers to the package.json
             const packageJsonPath = _Abs(`${targetPath}/package.json`);
             const packageJson = JSON.parse(fs.readFile(packageJsonPath)) as EntryPointPackageJson;
             packageJson.__processed_by_ivy_ngcc__ = {
               fesm2015: NGCC_VERSION,
             };
             fs.writeFile(packageJsonPath, JSON.stringify(packageJson));

             const finder = new TargetedEntryPointFinder(
                 fs, config, logger, resolver, basePath, undefined, targetPath);
             expect(finder.targetNeedsProcessingOrCleaning(['fesm2015', 'esm5'], false))
                 .toBe(false);
           });
      });
    });

    function createPackage(
        basePath: AbsoluteFsPath, packageName: string, deps: string[] = []): TestFile[] {
      return [
        {
          name: _Abs(`${basePath}/${packageName}/package.json`),
          contents: JSON.stringify({
            name: packageName,
            typings: `./${packageName}.d.ts`,
            fesm2015: `./fesm2015/${packageName}.js`,
            esm5: `./esm5/${packageName}.js`,
            main: `./common/${packageName}.js`,
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
        {
          name: _Abs(`${basePath}/${packageName}/esm5/${packageName}.js`),
          contents: deps.map((dep, i) => `import * as i${i} from '${dep}';`).join('\n'),
        },
        {
          name: _Abs(`${basePath}/${packageName}/commonjs/${packageName}.js`),
          contents: deps.map((dep, i) => `var i${i} = require('${dep}');`).join('\n'),
        },
      ];
    }
  });
});

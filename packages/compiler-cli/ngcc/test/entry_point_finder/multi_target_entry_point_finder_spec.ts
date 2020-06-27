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
import {loadTestFiles} from '../../../test/helpers';
import {DependencyResolver} from '../../src/dependencies/dependency_resolver';
import {DtsDependencyHost} from '../../src/dependencies/dts_dependency_host';
import {EsmDependencyHost} from '../../src/dependencies/esm_dependency_host';
import {ModuleResolver} from '../../src/dependencies/module_resolver';
import {BasePaths} from '../../src/entry_point_finder/base_paths';
import {EntryPointCollector} from '../../src/entry_point_finder/entry_point_collector';
import {MultiTargetEntryPointFinder} from '../../src/entry_point_finder/multi_target_entry_point_finder';
import {NgccConfiguration} from '../../src/packages/configuration';
import {EntryPoint} from '../../src/packages/entry_point';
import {EntryPointManifest} from '../../src/packages/entry_point_manifest';

runInEachFileSystem(() => {
  describe('MultiTargetEntryPointFinder', () => {
    let fs: FileSystem;
    let logger: MockLogger;
    let resolver: DependencyResolver;
    let collector: EntryPointCollector;
    let manifest: EntryPointManifest;
    let config: NgccConfiguration;
    let basePath: AbsoluteFsPath;
    let _Abs: typeof absoluteFrom;

    beforeEach(() => {
      fs = getFileSystem();
      _Abs = absoluteFrom;
      basePath = _Abs('/node_modules');
      fs.ensureDir(basePath);
      logger = new MockLogger();
      manifest = new EntryPointManifest(fs, config, logger);
      const srcHost = new EsmDependencyHost(fs, new ModuleResolver(fs));
      const dtsHost = new DtsDependencyHost(fs);
      config = new NgccConfiguration(fs, _Abs('/'));
      resolver = new DependencyResolver(fs, logger, config, {esm2015: srcHost}, dtsHost);
      collector = new EntryPointCollector(fs, config, logger, resolver);
    });

    describe('findEntryPoints()', () => {
      it('should throw an error if the file does not exist', () => {
        const entryPointListFilePath = _Abs('/entry-point-list.json');
        const finder = new MultiTargetEntryPointFinder(
            fs, logger, resolver, undefined, collector, manifest, basePath, new BasePaths(logger),
            entryPointListFilePath);
        try {
          finder.findEntryPoints();
          fail('Expected findEntryPoints() to throw');
        } catch (e) {
          expect(e.message).toContain(
              'Failed to load entry-points list file at ' + entryPointListFilePath);
        }
      });

      it('should throw an error if the file is not parseable JSON', () => {
        const entryPointListFilePath = _Abs('/entry-point-list.json');
        fs.writeFile(entryPointListFilePath, 'this is not JSON');
        const finder = new MultiTargetEntryPointFinder(
            fs, logger, resolver, undefined, collector, manifest, basePath, new BasePaths(logger),
            entryPointListFilePath);
        try {
          finder.findEntryPoints();
          fail('Expected findEntryPoints() to throw');
        } catch (e) {
          expect(e.message).toContain(
              `Failed to parse entry-points list file from ${entryPointListFilePath} as JSON`);
        }
      });

      it('should return an empty list of entry-points if none are defined', () => {
        const noEntryPointListFilePath = _Abs('/no-entry-point-list.json');
        fs.writeFile(noEntryPointListFilePath, '[]');
        const finder = new MultiTargetEntryPointFinder(
            fs, logger, resolver, undefined, collector, manifest, basePath, new BasePaths(logger),
            noEntryPointListFilePath);
        const noEntryPointInfo = finder.findEntryPoints();
        expect(noEntryPointInfo.entryPoints).toEqual([]);
      });

      it('should read in the entry-point paths mentioned in the entry-point list file and sort them by dependency',
         () => {
           const basePath = _Abs('/project/node_modules');
           loadTestFiles([
             ...createPackage(basePath, 'common'),
             ...createPackage(fs.resolve(basePath, 'common'), 'http', ['common']),
             ...createPackage(
                 fs.resolve(basePath, 'common/http'), 'testing', ['common/http', 'common/testing']),
             ...createPackage(fs.resolve(basePath, 'common'), 'testing', ['common']),
             ...createPackage(fs.resolve(basePath), 'not-used'),
           ]);

           const entryPointListFilePath = _Abs('/entry-point-files.json');
           fs.writeFile(entryPointListFilePath, JSON.stringify([
             'common/http/testing',
             'common/http',
             'common',
             'common/testing',
           ]));

           const finder = new MultiTargetEntryPointFinder(
               fs, logger, resolver, undefined, collector, manifest, basePath,
               new BasePaths(logger), entryPointListFilePath);
           const entryPointInfo = finder.findEntryPoints();
           expect(dumpEntryPointPaths(basePath, entryPointInfo.entryPoints)).toEqual([
             ['common', 'common'],
             ['common', 'common/http'],
             ['common', 'common/testing'],
             ['common', 'common/http/testing'],
           ]);
         });
    });

    function createPackage(
        basePath: AbsoluteFsPath, packageName: string, deps: string[] = [],
        isCompiledByAngular = true): TestFile[] {
      const files: TestFile[] = [
        {
          name: _Abs(`${basePath}/${packageName}/package.json`),
          contents: JSON.stringify({
            typings: `./${packageName}.d.ts`,
            fesm2015: `./fesm2015/${packageName}.js`,
          })
        },
        {
          name: _Abs(`${basePath}/${packageName}/${packageName}.d.ts`),
          contents: deps.map((dep, i) => `import * as i${i} from '${dep}';`).join('\n'),
        },
        {
          name: _Abs(`${basePath}/${packageName}/fesm2015/${packageName}.js`),
          contents: deps.map((dep, i) => `import * as i${i} from '${dep}';`).join('\n'),
        },
      ];

      if (isCompiledByAngular) {
        files.push({
          name: _Abs(`${basePath}/${packageName}/${packageName}.metadata.json`),
          contents: 'metadata info'
        });
      }

      return files;
    }

    function dumpEntryPointPaths(
        basePath: AbsoluteFsPath, entryPoints: EntryPoint[]): [string, string][] {
      return entryPoints.map(
          x => [fs.relative(basePath, x.packagePath), fs.relative(basePath, x.path)]);
    }
  });
});

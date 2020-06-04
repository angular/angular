/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {absoluteFrom, AbsoluteFsPath, FileSystem, getFileSystem, relative} from '../../../src/ngtsc/file_system';
import {runInEachFileSystem, TestFile} from '../../../src/ngtsc/file_system/testing';
import {readConfiguration} from '../../../src/perform_compile';
import {loadTestFiles} from '../../../test/helpers';
import {DependencyResolver} from '../../src/dependencies/dependency_resolver';
import {DtsDependencyHost} from '../../src/dependencies/dts_dependency_host';
import {EsmDependencyHost} from '../../src/dependencies/esm_dependency_host';
import {ModuleResolver} from '../../src/dependencies/module_resolver';
import {ProgramBasedEntryPointFinder} from '../../src/entry_point_finder/program_based_entry_point_finder';
import {NgccConfiguration} from '../../src/packages/configuration';
import {EntryPoint} from '../../src/packages/entry_point';
import {EntryPointManifest} from '../../src/packages/entry_point_manifest';
import {MockLogger} from '../helpers/mock_logger';

runInEachFileSystem(() => {
  describe('ProgramBasedEntryPointFinder', () => {
    let fs: FileSystem;
    let _Abs: typeof absoluteFrom;
    let projectPath: AbsoluteFsPath;
    let basePath: AbsoluteFsPath;
    let angularNamespacePath: AbsoluteFsPath;

    beforeEach(() => {
      fs = getFileSystem();
      _Abs = absoluteFrom;
      projectPath = _Abs('/sub_entry_points');
      basePath = _Abs('/sub_entry_points/node_modules');
      angularNamespacePath = fs.resolve(basePath, '@angular');
    });

    describe('findEntryPoints()', () => {
      it('should find entry-points imported into the program', () => {
        loadTestFiles([
          ...createProgram(projectPath),
          ...createPackage(angularNamespacePath, 'core'),
          ...createPackage(angularNamespacePath, 'common'),
          ...createPackage(fs.resolve(angularNamespacePath, 'common'), 'http', ['@angular/common']),
          ...createPackage(
              fs.resolve(angularNamespacePath, 'common/http'), 'testing',
              ['common/http', 'common/testing']),
          ...createPackage(
              fs.resolve(angularNamespacePath, 'common'), 'testing', ['@angular/common']),
        ]);
        const finder = createFinder();
        const {entryPoints} = finder.findEntryPoints();
        expect(dumpEntryPointPaths(basePath, entryPoints)).toEqual([
          ['@angular/core', '@angular/core'],
          ['@angular/common', '@angular/common'],
          ['@angular/common', '@angular/common/http'],
        ]);
      });

      function createFinder(): ProgramBasedEntryPointFinder {
        const tsConfig = readConfiguration(`${projectPath}/tsconfig.json`);
        const baseUrl = fs.resolve(projectPath, tsConfig.options.basePath!);
        const paths = tsConfig.options.paths!;

        const logger = new MockLogger();
        const srcHost = new EsmDependencyHost(fs, new ModuleResolver(fs, {baseUrl, paths}));
        const dtsHost = new DtsDependencyHost(fs);
        const config = new NgccConfiguration(fs, projectPath);
        const resolver = new DependencyResolver(fs, logger, config, {esm2015: srcHost}, dtsHost);
        const manifest = new EntryPointManifest(fs, config, logger);
        return new ProgramBasedEntryPointFinder(
            fs, config, logger, resolver, basePath, tsConfig, projectPath);
      }

      function createProgram(projectPath: AbsoluteFsPath): TestFile[] {
        return [
          {
            name: _Abs(`${projectPath}/package.json`),
            contents: '',
          },
          {
            name: _Abs(`${projectPath}/tsconfig.json`),
            contents: `{
              "files": [
                "src/main.ts"
              ],
              "compilerOptions": {
                "baseUrl": ".",
                "paths": {
                  "lib/*": ["lib/*"]
                }
              }
            }`,
          },
          {
            name: _Abs(`${projectPath}/src/main.ts`),
            contents: `
            import {AppComponent} from './app.component';
            import * from './app.module';
            import * from 'lib/service';
            `,
          },
          {
            name: _Abs(`${projectPath}/src/app.component.ts`),
            contents: `
            import * as core from '@angular/core';
            export class AppComponent {}
            `,
          },
          {
            name: _Abs(`${projectPath}/src/app.module.ts`),
            contents: `
            import {NgModule} from '@angular/core';
            import * as common from '@angular/common';
            import {AppComponent} from './app.component';
            export class AppModule {}
            `,
          },
          {
            name: _Abs(`${projectPath}/lib/service/index.ts`),
            contents: `
            import * as http from '@angular/common/http';
            export class Service {}
            `,
          },
        ];
      }

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
        return entryPoints.map(x => [relative(basePath, x.package), relative(basePath, x.path)]);
      }
    });
  });
});

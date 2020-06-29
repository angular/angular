/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DepGraph} from 'dependency-graph';

import {absoluteFrom, AbsoluteFsPath, FileSystem, getFileSystem, relativeFrom} from '../../../src/ngtsc/file_system';
import {runInEachFileSystem} from '../../../src/ngtsc/file_system/testing';
import {MockLogger} from '../../../src/ngtsc/logging/testing';
import {DependencyInfo, EntryPointWithDependencies} from '../../src/dependencies/dependency_host';
import {DependencyResolver, SortedEntryPointsInfo} from '../../src/dependencies/dependency_resolver';
import {DtsDependencyHost} from '../../src/dependencies/dts_dependency_host';
import {EsmDependencyHost} from '../../src/dependencies/esm_dependency_host';
import {ModuleResolver} from '../../src/dependencies/module_resolver';
import {NgccConfiguration} from '../../src/packages/configuration';
import {EntryPoint} from '../../src/packages/entry_point';


interface DepMap {
  [path: string]: {resolved: string[], missing: string[], deepImports?: AbsoluteFsPath[]};
}

runInEachFileSystem(() => {
  describe('DependencyResolver', () => {
    let _: typeof absoluteFrom;
    let host: EsmDependencyHost;
    let dtsHost: EsmDependencyHost;
    let resolver: DependencyResolver;
    let fs: FileSystem;
    let config: NgccConfiguration;
    let logger: MockLogger;
    let moduleResolver: ModuleResolver;

    beforeEach(() => {
      _ = absoluteFrom;
      fs = getFileSystem();
      config = new NgccConfiguration(fs, _('/'));
      logger = new MockLogger();
      moduleResolver = new ModuleResolver(fs);
      host = new EsmDependencyHost(fs, moduleResolver);
      dtsHost = new DtsDependencyHost(fs);
      resolver = new DependencyResolver(fs, logger, config, {esm5: host, esm2015: host}, dtsHost);
    });

    describe('sortEntryPointsByDependency()', () => {
      let first: EntryPoint;
      let second: EntryPoint;
      let third: EntryPoint;
      let fourth: EntryPoint;
      let fifth: EntryPoint;
      let sixthIgnoreMissing: EntryPoint;
      let dependencies: DepMap;
      let dtsDependencies: DepMap;

      beforeEach(() => {
        first = {
          name: 'first',
          path: _('/first'),
          packageName: 'first',
          packagePath: _('/first'),
          packageJson: {esm5: './index.js'},
          typings: _('/first/index.d.ts'),
          compiledByAngular: true,
          ignoreMissingDependencies: false,
        } as EntryPoint;
        second = {
          name: 'second',
          path: _('/second'),
          packageName: 'second',
          packagePath: _('/second'),
          packageJson: {esm2015: './sub/index.js'},
          typings: _('/second/sub/index.d.ts'),
          compiledByAngular: true,
          ignoreMissingDependencies: false,
        } as EntryPoint;
        third = {
          name: 'third',
          path: _('/third'),
          packageName: 'third',
          packagePath: _('/third'),
          packageJson: {fesm5: './index.js'},
          typings: _('/third/index.d.ts'),
          compiledByAngular: true,
          ignoreMissingDependencies: false,
        } as EntryPoint;
        fourth = {
          name: 'fourth',
          path: _('/fourth'),
          packageName: 'fourth',
          packagePath: _('/fourth'),
          packageJson: {fesm2015: './sub2/index.js'},
          typings: _('/fourth/sub2/index.d.ts'),
          compiledByAngular: true,
          ignoreMissingDependencies: false,
        } as EntryPoint;
        fifth = {
          name: 'fifth',
          path: _('/fifth'),
          packageName: 'fifth',
          packagePath: _('/fifth'),
          packageJson: {module: './index.js'},
          typings: _('/fifth/index.d.ts'),
          compiledByAngular: true,
          ignoreMissingDependencies: false,
        } as EntryPoint;

        sixthIgnoreMissing = {
          name: 'sixth',
          path: _('/sixth'),
          packageName: 'sixth',
          packagePath: _('/sixth'),
          packageJson: {module: './index.js'},
          typings: _('/sixth/index.d.ts'),
          compiledByAngular: true,
          ignoreMissingDependencies: true,
        } as EntryPoint;

        dependencies = {
          [_('/first/index.js')]:
              {resolved: [second.path, third.path, _('/ignored-1')], missing: []},
          [_('/second/sub/index.js')]: {resolved: [third.path, fifth.path], missing: []},
          [_('/third/index.js')]: {resolved: [fourth.path, _('/ignored-2')], missing: []},
          [_('/fourth/sub2/index.js')]: {resolved: [fifth.path], missing: []},
          [_('/fifth/index.js')]: {resolved: [], missing: []},
        };
        dtsDependencies = {
          [_('/first/index.d.ts')]:
              {resolved: [second.path, third.path, _('/ignored-1')], missing: []},
          [_('/second/sub/index.d.ts')]: {resolved: [third.path, fifth.path], missing: []},
          [_('/third/index.d.ts')]: {resolved: [fourth.path, _('/ignored-2')], missing: []},
          [_('/fourth/sub2/index.d.ts')]: {resolved: [fifth.path], missing: []},
          [_('/fifth/index.d.ts')]: {resolved: [], missing: []},
        };
      });

      it('should order the entry points by their dependency on each other', () => {
        spyOn(host, 'collectDependencies')
            .and.callFake(createFakeComputeDependencies(dependencies));
        spyOn(dtsHost, 'collectDependencies')
            .and.callFake(createFakeComputeDependencies(dtsDependencies));
        const result = resolver.sortEntryPointsByDependency(
            getEntryPointsWithDeps(resolver, [fifth, first, fourth, second, third]));
        expect(result.entryPoints).toEqual([fifth, fourth, third, second, first]);
      });

      it('should remove entry-points that have missing direct dependencies', () => {
        spyOn(host, 'collectDependencies').and.callFake(createFakeComputeDependencies({
          [_('/first/index.js')]: {resolved: [], missing: [_('/missing')]},
          [_('/second/sub/index.js')]: {resolved: [], missing: []},
        }));
        spyOn(dtsHost, 'collectDependencies').and.callFake(createFakeComputeDependencies({
          [_('/first/index.d.ts')]: {resolved: [], missing: [_('/missing')]},
          [_('/second/sub/index.d.ts')]: {resolved: [], missing: []},
        }));
        const result =
            resolver.sortEntryPointsByDependency(getEntryPointsWithDeps(resolver, [first, second]));
        expect(result.entryPoints).toEqual([second]);
        expect(result.invalidEntryPoints).toEqual([
          {entryPoint: first, missingDependencies: [_('/missing')]},
        ]);
      });

      it('should remove entry points that depended upon an invalid entry-point', () => {
        spyOn(host, 'collectDependencies').and.callFake(createFakeComputeDependencies({
          [_('/first/index.js')]: {resolved: [second.path, third.path], missing: []},
          [_('/second/sub/index.js')]: {resolved: [], missing: [_('/missing')]},
          [_('/third/index.js')]: {resolved: [], missing: []},
        }));
        spyOn(dtsHost, 'collectDependencies').and.callFake(createFakeComputeDependencies({
          [_('/first/index.d.ts')]: {resolved: [second.path, third.path], missing: []},
          [_('/second/sub/index.d.ts')]: {resolved: [], missing: [_('/missing')]},
          [_('/third/index.d.ts')]: {resolved: [], missing: []},
        }));
        // Note that we will process `first` before `second`, which has the missing dependency.
        const result = resolver.sortEntryPointsByDependency(
            getEntryPointsWithDeps(resolver, [first, second, third]));
        expect(result.entryPoints).toEqual([third]);
        expect(result.invalidEntryPoints).toEqual([
          {entryPoint: second, missingDependencies: [_('/missing')]},
          {entryPoint: first, missingDependencies: [_('/missing')]},
        ]);
      });

      it('should remove entry points that will depend upon an invalid entry-point', () => {
        spyOn(host, 'collectDependencies').and.callFake(createFakeComputeDependencies({
          [_('/first/index.js')]: {resolved: [second.path, third.path], missing: []},
          [_('/second/sub/index.js')]: {resolved: [], missing: [_('/missing')]},
          [_('/third/index.js')]: {resolved: [], missing: []},
        }));
        spyOn(dtsHost, 'collectDependencies').and.callFake(createFakeComputeDependencies({
          [_('/first/index.d.ts')]: {resolved: [second.path, third.path], missing: []},
          [_('/second/sub/index.d.ts')]: {resolved: [], missing: [_('/missing')]},
          [_('/third/index.d.ts')]: {resolved: [], missing: []},
        }));
        // Note that we will process `first` after `second`, which has the missing dependency.
        const result = resolver.sortEntryPointsByDependency(
            getEntryPointsWithDeps(resolver, [second, first, third]));
        expect(result.entryPoints).toEqual([third]);
        expect(result.invalidEntryPoints).toEqual([
          {entryPoint: second, missingDependencies: [_('/missing')]},
          {entryPoint: first, missingDependencies: [second.path]},
        ]);
      });

      it('should cope with entry points that will depend upon an invalid entry-point, when told to ignore missing dependencies',
         () => {
           spyOn(host, 'collectDependencies').and.callFake(createFakeComputeDependencies({
             [_('/first/index.js')]: {resolved: [sixthIgnoreMissing.path], missing: []},
             [_('/sixth/index.js')]: {resolved: [], missing: [_('/missing')]},
           }));
           spyOn(dtsHost, 'collectDependencies').and.callFake(createFakeComputeDependencies({
             [_('/first/index.d.ts')]: {resolved: [sixthIgnoreMissing.path], missing: []},
             [_('/sixth/index.d.ts')]: {resolved: [], missing: [_('/missing')]},
           }));
           // Note that we will process `first` after `second`, which has the missing dependency.
           const result = resolver.sortEntryPointsByDependency(
               getEntryPointsWithDeps(resolver, [sixthIgnoreMissing, first]));
           expect(result.entryPoints).toEqual([sixthIgnoreMissing, first]);
           expect(result.invalidEntryPoints).toEqual([]);
         });

      it('should not transitively ignore missing dependencies', () => {
        spyOn(host, 'collectDependencies').and.callFake(createFakeComputeDependencies({
          [_('/first/index.js')]: {resolved: [], missing: [_('/missing')]},
          [_('/second/sub/index.js')]: {resolved: [first.path], missing: []},
          [_('/sixth/index.js')]: {resolved: [second.path], missing: []},
        }));
        spyOn(dtsHost, 'collectDependencies').and.callFake(createFakeComputeDependencies({
          [_('/first/index.d.ts')]: {resolved: [], missing: [_('/missing')]},
          [_('/second/sub/index.d.ts')]: {resolved: [first.path], missing: []},
          [_('/sixth/index.d.ts')]: {resolved: [second.path], missing: []},
        }));
        const result = resolver.sortEntryPointsByDependency(
            getEntryPointsWithDeps(resolver, [first, second, sixthIgnoreMissing]));
        // sixth has no missing dependencies, but it has _invalid_ dependencies, so it's not
        // compiled.
        expect(result.entryPoints).toEqual([]);
      });

      it('should cope with entry points having multiple indirect missing dependencies', () => {
        spyOn(host, 'collectDependencies').and.callFake(createFakeComputeDependencies({
          [_('/first/index.js')]: {resolved: [], missing: [_('/missing1')]},
          [_('/second/sub/index.js')]: {resolved: [], missing: [_('/missing2')]},
          [_('/third/index.js')]: {resolved: [first.path, second.path], missing: []},
        }));
        spyOn(dtsHost, 'collectDependencies').and.callFake(createFakeComputeDependencies({
          [_('/first/index.d.ts')]: {resolved: [], missing: [_('/missing1')]},
          [_('/second/sub/index.d.ts')]: {resolved: [], missing: [_('/missing2')]},
          [_('/third/index.d.ts')]: {resolved: [first.path, second.path], missing: []},
        }));
        const result = resolver.sortEntryPointsByDependency(
            getEntryPointsWithDeps(resolver, [first, second, third]));
        expect(result.entryPoints).toEqual([]);
        expect(result.invalidEntryPoints).toEqual([
          {entryPoint: first, missingDependencies: [_('/missing1')]},
          {entryPoint: second, missingDependencies: [_('/missing2')]},
          {entryPoint: third, missingDependencies: [first.path]},
        ]);
      });

      it('should log a warning for deep imports', () => {
        spyOn(host, 'collectDependencies').and.callFake(createFakeComputeDependencies({
          [_('/first/index.js')]: {resolved: [], missing: [], deepImports: [_('/deep/one')]},
        }));
        spyOn(dtsHost, 'collectDependencies').and.callFake(createFakeComputeDependencies({
          [_('/first/index.d.ts')]: {resolved: [], missing: []},
        }));
        const result =
            resolver.sortEntryPointsByDependency(getEntryPointsWithDeps(resolver, [first]));
        expect(result.entryPoints).toEqual([first]);
        expect(logger.logs.warn).toEqual([[
          `Entry point 'first' contains deep imports into '${
              _('/deep/one')}'. This is probably not a problem, but may cause the compilation of entry points to be out of order.`
        ]]);
      });

      it('should not log a warning for ignored deep imports', () => {
        spyOn(host, 'collectDependencies').and.callFake(createFakeComputeDependencies({
          [_('/project/node_modules/test-package/test-entry-point/index.js')]: {
            resolved: [],
            missing: [],
            deepImports: [
              _('/project/node_modules/deep/one'), _('/project/node_modules/deep/two'),
              _('/project/node_modules/deeper/one'), _('/project/node_modules/deeper/two')
            ]
          },
        }));
        spyOn(dtsHost, 'collectDependencies').and.callFake(createFakeComputeDependencies({
          [_('/project/node_modules/test-package/test-entry-point/index.d.ts')]: {
            resolved: [],
            missing: [],
          },
        }));
        // Setup the configuration to ignore deep imports that contain either "deep/" or "two".
        fs.ensureDir(_('/project'));
        fs.writeFile(
            _('/project/ngcc.config.js'),
            `module.exports = { packages: { 'test-package': { ignorableDeepImportMatchers: [/deep\\//, /two/] } } };`);
        config = new NgccConfiguration(fs, _('/project'));
        resolver = new DependencyResolver(fs, logger, config, {esm5: host, esm2015: host}, dtsHost);
        const testEntryPoint = {
          name: 'test-package/test-entry-point',
          path: _('/project/node_modules/test-package/test-entry-point'),
          packageName: 'test-package',
          packagePath: _('/project/node_modules/test-package'),
          packageJson: {esm5: './index.js'},
          typings: _('/project/node_modules/test-package/test-entry-point/index.d.ts'),
          compiledByAngular: true,
          ignoreMissingDependencies: false,
        } as EntryPoint;

        const result = resolver.sortEntryPointsByDependency(
            getEntryPointsWithDeps(resolver, [testEntryPoint]));
        expect(result.entryPoints).toEqual([testEntryPoint]);
        expect(logger.logs.warn).toEqual([[
          `Entry point 'test-package/test-entry-point' contains deep imports into '${
              _('/project/node_modules/deeper/one')}'. This is probably not a problem, but may cause the compilation of entry points to be out of order.`
        ]]);
      });

      it('should error if the entry point does not have a suitable format', () => {
        expect(() => resolver.sortEntryPointsByDependency(getEntryPointsWithDeps(resolver, [
          {path: '/first', packageJson: {}, compiledByAngular: true} as EntryPoint
        ]))).toThrowError(`There is no appropriate source code format in '/first' entry-point.`);
      });

      it('should error if there is no appropriate DependencyHost for the given formats', () => {
        resolver = new DependencyResolver(fs, new MockLogger(), config, {esm2015: host}, host);
        expect(
            () => resolver.sortEntryPointsByDependency(getEntryPointsWithDeps(resolver, [first])))
            .toThrowError(
                `Could not find a suitable format for computing dependencies of entry-point: '${
                    first.path}'.`);
      });

      it('should capture any dependencies that were ignored', () => {
        spyOn(host, 'collectDependencies')
            .and.callFake(createFakeComputeDependencies(dependencies));
        spyOn(dtsHost, 'collectDependencies')
            .and.callFake(createFakeComputeDependencies(dtsDependencies));
        const result = resolver.sortEntryPointsByDependency(
            getEntryPointsWithDeps(resolver, [fifth, first, fourth, second, third]));
        expect(result.ignoredDependencies).toEqual([
          {entryPoint: first, dependencyPath: _('/ignored-1')},
          {entryPoint: third, dependencyPath: _('/ignored-2')},
        ]);
      });

      it('should return the computed dependency graph', () => {
        spyOn(host, 'collectDependencies')
            .and.callFake(createFakeComputeDependencies(dependencies));
        spyOn(dtsHost, 'collectDependencies')
            .and.callFake(createFakeComputeDependencies(dtsDependencies));
        const result = resolver.sortEntryPointsByDependency(
            getEntryPointsWithDeps(resolver, [fifth, first, fourth, second, third]));

        expect(result.graph).toEqual(jasmine.any(DepGraph));
        expect(result.graph.size()).toBe(5);
        expect(result.graph.dependenciesOf(third.path)).toEqual([fifth.path, fourth.path]);
      });

      it('should only return dependencies of the target, if provided', () => {
        spyOn(host, 'collectDependencies')
            .and.callFake(createFakeComputeDependencies(dependencies));
        spyOn(dtsHost, 'collectDependencies')
            .and.callFake(createFakeComputeDependencies(dtsDependencies));
        const entryPoints = getEntryPointsWithDeps(resolver, [fifth, first, fourth, second, third]);
        let sorted: SortedEntryPointsInfo;

        sorted = resolver.sortEntryPointsByDependency(entryPoints, first);
        expect(sorted.entryPoints).toEqual([fifth, fourth, third, second, first]);
        sorted = resolver.sortEntryPointsByDependency(entryPoints, second);
        expect(sorted.entryPoints).toEqual([fifth, fourth, third, second]);
        sorted = resolver.sortEntryPointsByDependency(entryPoints, third);
        expect(sorted.entryPoints).toEqual([fifth, fourth, third]);
        sorted = resolver.sortEntryPointsByDependency(entryPoints, fourth);
        expect(sorted.entryPoints).toEqual([fifth, fourth]);
        sorted = resolver.sortEntryPointsByDependency(entryPoints, fifth);
        expect(sorted.entryPoints).toEqual([fifth]);
      });

      it('should not process the provided target if it has missing dependencies', () => {
        spyOn(host, 'collectDependencies').and.callFake(createFakeComputeDependencies({
          [_('/first/index.js')]: {resolved: [], missing: [_('/missing')]},
        }));
        spyOn(dtsHost, 'collectDependencies').and.callFake(createFakeComputeDependencies({
          [_('/first/index.d.ts')]: {resolved: [], missing: [_('/missing')]},
        }));
        const entryPoints = getEntryPointsWithDeps(resolver, [first]);
        let sorted: SortedEntryPointsInfo;

        sorted = resolver.sortEntryPointsByDependency(entryPoints, first);
        expect(sorted.entryPoints).toEqual([]);
        expect(sorted.invalidEntryPoints[0].entryPoint).toEqual(first);
        expect(sorted.invalidEntryPoints[0].missingDependencies).toEqual([_('/missing')]);
      });

      it('should not consider builtin NodeJS modules as missing dependency', () => {
        spyOn(host, 'collectDependencies').and.callFake(createFakeComputeDependencies({
          [_('/first/index.js')]: {resolved: [], missing: ['fs']},
        }));
        spyOn(dtsHost, 'collectDependencies').and.callFake(createFakeComputeDependencies({
          [_('/first/index.d.ts')]: {resolved: [], missing: ['fs']},
        }));
        const entryPoints = getEntryPointsWithDeps(resolver, [first]);
        let sorted: SortedEntryPointsInfo;

        sorted = resolver.sortEntryPointsByDependency(entryPoints, first);
        expect(sorted.entryPoints).toEqual([first]);
        expect(sorted.invalidEntryPoints).toEqual([]);
        expect(sorted.ignoredDependencies).toEqual([]);
      });

      it('should use the appropriate DependencyHost for each entry-point', () => {
        const esm5Host = new EsmDependencyHost(fs, moduleResolver);
        const esm2015Host = new EsmDependencyHost(fs, moduleResolver);
        const dtsHost = new DtsDependencyHost(fs);
        resolver = new DependencyResolver(
            fs, new MockLogger(), config, {esm5: esm5Host, esm2015: esm2015Host}, dtsHost);
        spyOn(esm5Host, 'collectDependencies')
            .and.callFake(createFakeComputeDependencies(dependencies));
        spyOn(esm2015Host, 'collectDependencies')
            .and.callFake(createFakeComputeDependencies(dependencies));
        spyOn(dtsHost, 'collectDependencies')
            .and.callFake(createFakeComputeDependencies(dtsDependencies));
        const result = resolver.sortEntryPointsByDependency(
            getEntryPointsWithDeps(resolver, [fifth, first, fourth, second, third]));
        expect(result.entryPoints).toEqual([fifth, fourth, third, second, first]);

        expect(esm5Host.collectDependencies)
            .toHaveBeenCalledWith(fs.resolve(first.path, 'index.js'), jasmine.any(Object));
        expect(esm5Host.collectDependencies)
            .not.toHaveBeenCalledWith(fs.resolve(second.path, 'sub/index.js'), jasmine.any(Object));
        expect(esm5Host.collectDependencies)
            .toHaveBeenCalledWith(fs.resolve(third.path, 'index.js'), jasmine.any(Object));
        expect(esm5Host.collectDependencies)
            .not.toHaveBeenCalledWith(
                fs.resolve(fourth.path, 'sub2/index.js'), jasmine.any(Object));
        expect(esm5Host.collectDependencies)
            .toHaveBeenCalledWith(fs.resolve(fifth.path, 'index.js'), jasmine.any(Object));

        expect(esm2015Host.collectDependencies)
            .not.toHaveBeenCalledWith(fs.resolve(first.path, 'index.js'), jasmine.any(Object));
        expect(esm2015Host.collectDependencies)
            .toHaveBeenCalledWith(fs.resolve(second.path, 'sub/index.js'), jasmine.any(Object));
        expect(esm2015Host.collectDependencies)
            .not.toHaveBeenCalledWith(fs.resolve(third.path, 'index.js'), jasmine.any(Object));
        expect(esm2015Host.collectDependencies)
            .toHaveBeenCalledWith(fs.resolve(fourth.path, 'sub2/index.js'), jasmine.any(Object));
        expect(esm2015Host.collectDependencies)
            .not.toHaveBeenCalledWith(fs.resolve(fifth.path, 'index.js'), jasmine.any(Object));

        expect(dtsHost.collectDependencies)
            .toHaveBeenCalledWith(fs.resolve(first.path, 'index.d.ts'), jasmine.any(Object));
        expect(dtsHost.collectDependencies)
            .toHaveBeenCalledWith(fs.resolve(second.path, 'sub/index.d.ts'), jasmine.any(Object));
        expect(dtsHost.collectDependencies)
            .toHaveBeenCalledWith(fs.resolve(third.path, 'index.d.ts'), jasmine.any(Object));
        expect(dtsHost.collectDependencies)
            .toHaveBeenCalledWith(fs.resolve(fourth.path, 'sub2/index.d.ts'), jasmine.any(Object));
        expect(dtsHost.collectDependencies)
            .toHaveBeenCalledWith(fs.resolve(fifth.path, 'index.d.ts'), jasmine.any(Object));
      });

      it('should merge "typings-only" dependencies with source dependencies', () => {
        spyOn(host, 'collectDependencies').and.callFake(createFakeComputeDependencies({
          [_('/first/index.js')]: {resolved: [], missing: []},
          [_('/second/sub/index.js')]: {resolved: [], missing: [_('/missing1')]},
          [_('/third/index.js')]: {resolved: [first.path], missing: []},
        }));
        spyOn(dtsHost, 'collectDependencies').and.callFake(createFakeComputeDependencies({
          [_('/first/index.d.ts')]: {resolved: [], missing: []},
          [_('/second/sub/index.d.ts')]: {resolved: [], missing: [_('/missing2')]},
          [_('/third/index.d.ts')]: {resolved: [second.path], missing: []},
        }));
        const entryPoints = getEntryPointsWithDeps(resolver, [first, second, third]);
        const sorted = resolver.sortEntryPointsByDependency(entryPoints);
        expect(sorted.entryPoints).toEqual([first]);
        expect(sorted.invalidEntryPoints).toEqual([
          {entryPoint: second, missingDependencies: [_('/missing1'), _('/missing2')]},
          {entryPoint: third, missingDependencies: [_('/second')]},
        ]);
      });

      function createFakeComputeDependencies(deps: DepMap) {
        return (entryPointPath: string, {dependencies, missing, deepImports}: DependencyInfo) => {
          deps[entryPointPath].resolved.forEach(dep => dependencies.add(absoluteFrom(dep)));
          deps[entryPointPath].missing.forEach(
              dep => missing.add(fs.isRooted(dep) ? absoluteFrom(dep) : relativeFrom(dep)));
          if (deps[entryPointPath].deepImports) {
            deps[entryPointPath].deepImports!.forEach(dep => deepImports.add(dep));
          }
          return {dependencies, missing, deepImports};
        };
      }

      function getEntryPointsWithDeps(
          resolver: DependencyResolver, entryPoints: EntryPoint[]): EntryPointWithDependencies[] {
        return entryPoints.map(entryPoint => resolver.getEntryPointWithDependencies(entryPoint));
      }
    });
  });
});

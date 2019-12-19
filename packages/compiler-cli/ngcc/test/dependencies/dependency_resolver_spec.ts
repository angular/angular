/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DepGraph} from 'dependency-graph';

import {FileSystem, absoluteFrom, getFileSystem, relativeFrom} from '../../../src/ngtsc/file_system';
import {runInEachFileSystem} from '../../../src/ngtsc/file_system/testing';
import {DependencyInfo} from '../../src/dependencies/dependency_host';
import {DependencyResolver, SortedEntryPointsInfo} from '../../src/dependencies/dependency_resolver';
import {EsmDependencyHost} from '../../src/dependencies/esm_dependency_host';
import {ModuleResolver} from '../../src/dependencies/module_resolver';
import {EntryPoint} from '../../src/packages/entry_point';
import {MockLogger} from '../helpers/mock_logger';


interface DepMap {
  [path: string]: {resolved: string[], missing: string[]};
}

runInEachFileSystem(() => {
  describe('DependencyResolver', () => {
    let _: typeof absoluteFrom;
    let host: EsmDependencyHost;
    let resolver: DependencyResolver;
    let fs: FileSystem;
    let moduleResolver: ModuleResolver;

    beforeEach(() => {
      _ = absoluteFrom;
      fs = getFileSystem();
      moduleResolver = new ModuleResolver(fs);
      host = new EsmDependencyHost(fs, moduleResolver);
      resolver = new DependencyResolver(fs, new MockLogger(), {esm5: host, esm2015: host}, host);
    });

    describe('sortEntryPointsByDependency()', () => {
      let first: EntryPoint;
      let second: EntryPoint;
      let third: EntryPoint;
      let fourth: EntryPoint;
      let fifth: EntryPoint;
      let sixthIgnoreMissing: EntryPoint;
      let dependencies: DepMap;

      beforeEach(() => {
        first = {
          path: _('/first'),
          packageJson: {esm5: './index.js'},
          compiledByAngular: true,
          ignoreMissingDependencies: false,
          typings: _('/first/index.d.ts'),
        } as EntryPoint;
        second = {
          path: _('/second'),
          packageJson: {esm2015: './sub/index.js'},
          compiledByAngular: true,
          ignoreMissingDependencies: false,
          typings: _('/second/sub/index.d.ts'),
        } as EntryPoint;
        third = {
          path: _('/third'),
          packageJson: {fesm5: './index.js'},
          compiledByAngular: true,
          ignoreMissingDependencies: false,
          typings: _('/third/index.d.ts'),
        } as EntryPoint;
        fourth = {
          path: _('/fourth'),
          packageJson: {fesm2015: './sub2/index.js'},
          compiledByAngular: true,
          ignoreMissingDependencies: false,
          typings: _('/fourth/sub2/index.d.ts'),
        } as EntryPoint;
        fifth = {
          path: _('/fifth'),
          packageJson: {module: './index.js'},
          compiledByAngular: true,
          ignoreMissingDependencies: false,
          typings: _('/fifth/index.d.ts'),
        } as EntryPoint;

        sixthIgnoreMissing = {
          path: _('/sixth'),
          packageJson: {module: './index.js'},
          compiledByAngular: true,
          ignoreMissingDependencies: true,
          typings: _('/sixth/index.d.ts'),
        } as EntryPoint;

        dependencies = {
          [_('/first/index.js')]:
              {resolved: [second.path, third.path, _('/ignored-1')], missing: []},
          [_('/second/sub/index.js')]: {resolved: [third.path, fifth.path], missing: []},
          [_('/third/index.js')]: {resolved: [fourth.path, _('/ignored-2')], missing: []},
          [_('/fourth/sub2/index.js')]: {resolved: [fifth.path], missing: []},
          [_('/fifth/index.js')]: {resolved: [], missing: []},
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
        const result = resolver.sortEntryPointsByDependency([fifth, first, fourth, second, third]);
        expect(result.entryPoints).toEqual([fifth, fourth, third, second, first]);
      });

      it('should remove entry-points that have missing direct dependencies', () => {
        spyOn(host, 'collectDependencies').and.callFake(createFakeComputeDependencies({
          [_('/first/index.js')]: {resolved: [], missing: [_('/missing')]},
          [_('/second/sub/index.js')]: {resolved: [], missing: []},
          [_('/first/index.d.ts')]: {resolved: [], missing: [_('/missing')]},
          [_('/second/sub/index.d.ts')]: {resolved: [], missing: []},
        }));
        const result = resolver.sortEntryPointsByDependency([first, second]);
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
          [_('/first/index.d.ts')]: {resolved: [second.path, third.path], missing: []},
          [_('/second/sub/index.d.ts')]: {resolved: [], missing: [_('/missing')]},
          [_('/third/index.d.ts')]: {resolved: [], missing: []},
        }));
        // Note that we will process `first` before `second`, which has the missing dependency.
        const result = resolver.sortEntryPointsByDependency([first, second, third]);
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
          [_('/first/index.d.ts')]: {resolved: [second.path, third.path], missing: []},
          [_('/second/sub/index.d.ts')]: {resolved: [], missing: [_('/missing')]},
          [_('/third/index.d.ts')]: {resolved: [], missing: []},
        }));
        // Note that we will process `first` after `second`, which has the missing dependency.
        const result = resolver.sortEntryPointsByDependency([second, first, third]);
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
             [_('/first/index.d.ts')]: {resolved: [sixthIgnoreMissing.path], missing: []},
             [_('/sixth/index.d.ts')]: {resolved: [], missing: [_('/missing')]},
           }));
           // Note that we will process `first` after `second`, which has the missing dependency.
           const result = resolver.sortEntryPointsByDependency([sixthIgnoreMissing, first]);
           expect(result.entryPoints).toEqual([sixthIgnoreMissing, first]);
           expect(result.invalidEntryPoints).toEqual([]);
         });

      it('should not transitively ignore missing dependencies', () => {
        spyOn(host, 'collectDependencies').and.callFake(createFakeComputeDependencies({
          [_('/first/index.js')]: {resolved: [], missing: [_('/missing')]},
          [_('/second/sub/index.js')]: {resolved: [first.path], missing: []},
          [_('/sixth/index.js')]: {resolved: [second.path], missing: []},
          [_('/first/index.d.ts')]: {resolved: [], missing: [_('/missing')]},
          [_('/second/sub/index.d.ts')]: {resolved: [first.path], missing: []},
          [_('/sixth/index.d.ts')]: {resolved: [second.path], missing: []},
        }));
        const result = resolver.sortEntryPointsByDependency([first, second, sixthIgnoreMissing]);
        // sixth has no missing dependencies, but it has _invalid_ dependencies, so it's not
        // compiled.
        expect(result.entryPoints).toEqual([]);
      });

      it('should cope with entry points having multiple indirect missing dependencies', () => {
        spyOn(host, 'collectDependencies').and.callFake(createFakeComputeDependencies({
          [_('/first/index.js')]: {resolved: [], missing: [_('/missing1')]},
          [_('/second/sub/index.js')]: {resolved: [], missing: [_('/missing2')]},
          [_('/third/index.js')]: {resolved: [first.path, second.path], missing: []},
          [_('/first/index.d.ts')]: {resolved: [], missing: [_('/missing1')]},
          [_('/second/sub/index.d.ts')]: {resolved: [], missing: [_('/missing2')]},
          [_('/third/index.d.ts')]: {resolved: [first.path, second.path], missing: []},
        }));
        const result = resolver.sortEntryPointsByDependency([first, second, third]);
        expect(result.entryPoints).toEqual([]);
        expect(result.invalidEntryPoints).toEqual([
          {entryPoint: first, missingDependencies: [_('/missing1')]},
          {entryPoint: second, missingDependencies: [_('/missing2')]},
          {entryPoint: third, missingDependencies: [first.path]},
        ]);
      });

      it('should error if the entry point does not have a suitable format', () => {
        expect(() => resolver.sortEntryPointsByDependency([
          { path: '/first', packageJson: {}, compiledByAngular: true } as EntryPoint
        ])).toThrowError(`There is no appropriate source code format in '/first' entry-point.`);
      });

      it('should error if there is no appropriate DependencyHost for the given formats', () => {
        resolver = new DependencyResolver(fs, new MockLogger(), {esm2015: host}, host);
        expect(() => resolver.sortEntryPointsByDependency([first]))
            .toThrowError(
                `Could not find a suitable format for computing dependencies of entry-point: '${first.path}'.`);
      });

      it('should capture any dependencies that were ignored', () => {
        spyOn(host, 'collectDependencies')
            .and.callFake(createFakeComputeDependencies(dependencies));
        const result = resolver.sortEntryPointsByDependency([fifth, first, fourth, second, third]);
        expect(result.ignoredDependencies).toEqual([
          {entryPoint: first, dependencyPath: _('/ignored-1')},
          {entryPoint: third, dependencyPath: _('/ignored-2')},
        ]);
      });

      it('should return the computed dependency graph', () => {
        spyOn(host, 'collectDependencies')
            .and.callFake(createFakeComputeDependencies(dependencies));
        const result = resolver.sortEntryPointsByDependency([fifth, first, fourth, second, third]);

        expect(result.graph).toEqual(jasmine.any(DepGraph));
        expect(result.graph.size()).toBe(5);
        expect(result.graph.dependenciesOf(third.path)).toEqual([fifth.path, fourth.path]);
      });

      it('should only return dependencies of the target, if provided', () => {
        spyOn(host, 'collectDependencies')
            .and.callFake(createFakeComputeDependencies(dependencies));
        const entryPoints = [fifth, first, fourth, second, third];
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
          [_('/first/index.d.ts')]: {resolved: [], missing: [_('/missing')]},
        }));
        const entryPoints = [first];
        let sorted: SortedEntryPointsInfo;

        sorted = resolver.sortEntryPointsByDependency(entryPoints, first);
        expect(sorted.entryPoints).toEqual([]);
        expect(sorted.invalidEntryPoints[0].entryPoint).toEqual(first);
        expect(sorted.invalidEntryPoints[0].missingDependencies).toEqual([_('/missing')]);
      });

      it('should not consider builtin NodeJS modules as missing dependency', () => {
        spyOn(host, 'collectDependencies').and.callFake(createFakeComputeDependencies({
          [_('/first/index.js')]: {resolved: [], missing: ['fs']},
          [_('/first/index.d.ts')]: {resolved: [], missing: ['fs']},
        }));
        const entryPoints = [first];
        let sorted: SortedEntryPointsInfo;

        sorted = resolver.sortEntryPointsByDependency(entryPoints, first);
        expect(sorted.entryPoints).toEqual([first]);
        expect(sorted.invalidEntryPoints).toEqual([]);
        expect(sorted.ignoredDependencies).toEqual([]);
      });

      it('should use the appropriate DependencyHost for each entry-point', () => {
        const esm5Host = new EsmDependencyHost(fs, moduleResolver);
        const esm2015Host = new EsmDependencyHost(fs, moduleResolver);
        resolver = new DependencyResolver(
            fs, new MockLogger(), {esm5: esm5Host, esm2015: esm2015Host}, esm2015Host);
        spyOn(esm5Host, 'collectDependencies')
            .and.callFake(createFakeComputeDependencies(dependencies));
        spyOn(esm2015Host, 'collectDependencies')
            .and.callFake(createFakeComputeDependencies(dependencies));
        const result = resolver.sortEntryPointsByDependency([fifth, first, fourth, second, third]);
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
      });

      it('should merge "typings-only" dependencies with source dependencies', () => {
        spyOn(host, 'collectDependencies').and.callFake(createFakeComputeDependencies({
          [_('/first/index.js')]: {resolved: [], missing: []},
          [_('/second/sub/index.js')]: {resolved: [], missing: [_('/missing1')]},
          [_('/third/index.js')]: {resolved: [first.path], missing: []},
          [_('/first/index.d.ts')]: {resolved: [], missing: []},
          [_('/second/sub/index.d.ts')]: {resolved: [], missing: [_('/missing2')]},
          [_('/third/index.d.ts')]: {resolved: [second.path], missing: []},
        }));
        const entryPoints = [first, second, third];
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
          return {dependencies, missing, deepImports};
        };
      }
    });
  });
});

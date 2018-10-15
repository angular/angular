/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DependencyHost} from '../../src/packages/dependency_host';
import {DependencyResolver} from '../../src/packages/dependency_resolver';
import {EntryPoint} from '../../src/packages/entry_point';

describe('DependencyResolver', () => {
  let host: DependencyHost;
  let resolver: DependencyResolver;
  beforeEach(() => {
    host = new DependencyHost();
    resolver = new DependencyResolver(host);
  });
  describe('sortEntryPointsByDependency()', () => {
    const first = { path: 'first', fesm2015: 'first/index.ts' } as EntryPoint;
    const second = { path: 'second', esm2015: 'second/index.ts' } as EntryPoint;
    const third = { path: 'third', fesm2015: 'third/index.ts' } as EntryPoint;
    const fourth = { path: 'fourth', esm2015: 'fourth/index.ts' } as EntryPoint;
    const fifth = { path: 'fifth', fesm2015: 'fifth/index.ts' } as EntryPoint;

    const dependencies = {
      'first/index.ts': {resolved: ['second', 'third', 'ignored-1'], missing: []},
      'second/index.ts': {resolved: ['third', 'fifth'], missing: []},
      'third/index.ts': {resolved: ['fourth', 'ignored-2'], missing: []},
      'fourth/index.ts': {resolved: ['fifth'], missing: []},
      'fifth/index.ts': {resolved: [], missing: []},
    };

    it('should order the entry points by their dependency on each other', () => {
      spyOn(host, 'computeDependencies').and.callFake(createFakeComputeDependencies(dependencies));
      const result = resolver.sortEntryPointsByDependency([fifth, first, fourth, second, third]);
      expect(result.entryPoints).toEqual([fifth, fourth, third, second, first]);
    });

    it('should remove entry-points that have missing direct dependencies', () => {
      spyOn(host, 'computeDependencies').and.callFake(createFakeComputeDependencies({
        'first/index.ts': {resolved: [], missing: ['missing']},
        'second/index.ts': {resolved: [], missing: []},
      }));
      const result = resolver.sortEntryPointsByDependency([first, second]);
      expect(result.entryPoints).toEqual([second]);
      expect(result.invalidEntryPoints).toEqual([
        {entryPoint: first, missingDependencies: ['missing']},
      ]);
    });

    it('should remove entry points that depended upon an invalid entry-point', () => {
      spyOn(host, 'computeDependencies').and.callFake(createFakeComputeDependencies({
        'first/index.ts': {resolved: ['second'], missing: []},
        'second/index.ts': {resolved: [], missing: ['missing']},
        'third/index.ts': {resolved: [], missing: []},
      }));
      // Note that we will process `first` before `second`, which has the missing dependency.
      const result = resolver.sortEntryPointsByDependency([first, second, third]);
      expect(result.entryPoints).toEqual([third]);
      expect(result.invalidEntryPoints).toEqual([
        {entryPoint: second, missingDependencies: ['missing']},
        {entryPoint: first, missingDependencies: ['missing']},
      ]);
    });

    it('should remove entry points that will depend upon an invalid entry-point', () => {
      spyOn(host, 'computeDependencies').and.callFake(createFakeComputeDependencies({
        'first/index.ts': {resolved: ['second'], missing: []},
        'second/index.ts': {resolved: [], missing: ['missing']},
        'third/index.ts': {resolved: [], missing: []},
      }));
      // Note that we will process `first` after `second`, which has the missing dependency.
      const result = resolver.sortEntryPointsByDependency([second, first, third]);
      expect(result.entryPoints).toEqual([third]);
      expect(result.invalidEntryPoints).toEqual([
        {entryPoint: second, missingDependencies: ['missing']},
        {entryPoint: first, missingDependencies: ['second']},
      ]);
    });

    it('should error if the entry point does not have either the fesm2015 nor esm2015 formats',
       () => {
         expect(() => resolver.sortEntryPointsByDependency([{ path: 'first' } as EntryPoint]))
             .toThrowError(`ESM2015 format (flat and non-flat) missing in 'first' entry-point.`);
       });

    it('should capture any dependencies that were ignored', () => {
      spyOn(host, 'computeDependencies').and.callFake(createFakeComputeDependencies(dependencies));
      const result = resolver.sortEntryPointsByDependency([fifth, first, fourth, second, third]);
      expect(result.ignoredDependencies).toEqual([
        {entryPoint: first, dependencyPath: 'ignored-1'},
        {entryPoint: third, dependencyPath: 'ignored-2'},
      ]);
    });

    interface DepMap {
      [path: string]: {resolved: string[], missing: string[]};
    }

    function createFakeComputeDependencies(dependencies: DepMap) {
      return (entryPoint: string, resolved: Set<string>, missing: Set<string>) => {
        dependencies[entryPoint].resolved.forEach(dep => resolved.add(dep));
        dependencies[entryPoint].missing.forEach(dep => missing.add(dep));
      };
    }
  });
});

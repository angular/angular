/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {Reference} from '../../../src/ngtsc/imports';
import {AbsoluteFsPath} from '../../../src/ngtsc/path';
import {NgccReferencesRegistry} from '../../src/analysis/ngcc_references_registry';
import {PrivateDeclarationsAnalyzer} from '../../src/analysis/private_declarations_analyzer';
import {Esm2015ReflectionHost} from '../../src/host/esm2015_host';
import {MockLogger} from '../helpers/mock_logger';
import {getDeclaration, makeTestBundleProgram, makeTestProgram} from '../helpers/utils';

const _Abs = AbsoluteFsPath.from;

describe('PrivateDeclarationsAnalyzer', () => {
  describe('analyzeProgram()', () => {

    const TEST_PROGRAM = [
      {
        name: _Abs('/src/entry_point.js'),
        isRoot: true,
        contents: `
    export {PublicComponent} from './a';
    export {ModuleA} from './mod';
    export {ModuleB} from './b';
  `
      },
      {
        name: _Abs('/src/a.js'),
        isRoot: false,
        contents: `
    import {Component} from '@angular/core';
    export class PublicComponent {}
    PublicComponent.decorators = [
      {type: Component, args: [{selectors: 'a', template: ''}]}
    ];
  `
      },
      {
        name: _Abs('/src/b.js'),
        isRoot: false,
        contents: `
    import {Component, NgModule} from '@angular/core';
    class PrivateComponent1 {}
    PrivateComponent1.decorators = [
      {type: Component, args: [{selectors: 'b', template: ''}]}
    ];
    class PrivateComponent2 {}
    PrivateComponent2.decorators = [
      {type: Component, args: [{selectors: 'c', template: ''}]}
    ];
    export class ModuleB {}
    ModuleB.decorators = [
      {type: NgModule, args: [{declarations: [PrivateComponent1]}]}
    ];
  `
      },
      {
        name: _Abs('/src/c.js'),
        isRoot: false,
        contents: `
    import {Component} from '@angular/core';
    export class InternalComponent1 {}
    InternalComponent1.decorators = [
      {type: Component, args: [{selectors: 'd', template: ''}]}
    ];
    export class InternalComponent2 {}
    InternalComponent2.decorators = [
      {type: Component, args: [{selectors: 'e', template: ''}]}
    ];
  `
      },
      {
        name: _Abs('/src/mod.js'),
        isRoot: false,
        contents: `
    import {Component, NgModule} from '@angular/core';
    import {PublicComponent} from './a';
    import {ModuleB} from './b';
    import {InternalComponent1} from './c';
    export class ModuleA {}
    ModuleA.decorators = [
      {type: NgModule, args: [{
        declarations: [PublicComponent, InternalComponent1],
        imports: [ModuleB]
      }]}
    ];
  `
      }
    ];
    const TEST_DTS_PROGRAM = [
      {
        name: _Abs('/typings/entry_point.d.ts'),
        isRoot: true,
        contents: `
    export {PublicComponent} from './a';
    export {ModuleA} from './mod';
    export {ModuleB} from './b';
  `
      },
      {
        name: _Abs('/typings/a.d.ts'),
        isRoot: false,
        contents: `
    export declare class PublicComponent {}
  `
      },
      {
        name: _Abs('/typings/b.d.ts'),
        isRoot: false,
        contents: `
    export declare class ModuleB {}
  `
      },
      {
        name: _Abs('/typings/c.d.ts'),
        isRoot: false,
        contents: `
    export declare class InternalComponent1 {}
  `
      },
      {
        name: _Abs('/typings/mod.d.ts'),
        isRoot: false,
        contents: `
    import {PublicComponent} from './a';
    import {ModuleB} from './b';
    import {InternalComponent1} from './c';
    export declare class ModuleA {}
  `
      },
    ];

    it('should find all NgModule declarations that were not publicly exported from the entry-point',
       () => {
         const {program, referencesRegistry, analyzer} = setup(TEST_PROGRAM, TEST_DTS_PROGRAM);

         addToReferencesRegistry(program, referencesRegistry, _Abs('/src/a.js'), 'PublicComponent');
         addToReferencesRegistry(
             program, referencesRegistry, _Abs('/src/b.js'), 'PrivateComponent1');
         addToReferencesRegistry(
             program, referencesRegistry, _Abs('/src/c.js'), 'InternalComponent1');

         const analyses = analyzer.analyzeProgram(program);
         // Note that `PrivateComponent2` and `InternalComponent2` are not found because they are
         // not added to the ReferencesRegistry (i.e. they were not declared in an NgModule).
         expect(analyses.length).toEqual(2);
         expect(analyses).toEqual([
           {identifier: 'PrivateComponent1', from: _Abs('/src/b.js'), dtsFrom: null, alias: null},
           {
             identifier: 'InternalComponent1',
             from: _Abs('/src/c.js'),
             dtsFrom: _Abs('/typings/c.d.ts'),
             alias: null
           },
         ]);
       });

    const ALIASED_EXPORTS_PROGRAM = [
      {
        name: _Abs('/src/entry_point.js'),
        isRoot: true,
        contents: `
        // This component is only exported as an alias.
        export {ComponentOne as aliasedComponentOne} from './a';
        // This component is exported both as itself and an alias.
        export {ComponentTwo as aliasedComponentTwo, ComponentTwo} from './a';
      `
      },
      {
        name: _Abs('/src/a.js'),
        isRoot: false,
        contents: `
      import {Component} from '@angular/core';
      export class ComponentOne {}
      ComponentOne.decorators = [
        {type: Component, args: [{selectors: 'a', template: ''}]}
      ];

      export class ComponentTwo {}
      Component.decorators = [
        {type: Component, args: [{selectors: 'a', template: ''}]}
      ];
    `
      }
    ];
    const ALIASED_EXPORTS_DTS_PROGRAM = [
      {
        name: _Abs('/typings/entry_point.d.ts'),
        isRoot: true,
        contents: `
        export declare class aliasedComponentOne {}
        export declare class ComponentTwo {}
        export {ComponentTwo as aliasedComponentTwo}
      `
      },
    ];

    it('should find all non-public declarations that were aliased', () => {
      const {program, referencesRegistry, analyzer} =
          setup(ALIASED_EXPORTS_PROGRAM, ALIASED_EXPORTS_DTS_PROGRAM);

      addToReferencesRegistry(program, referencesRegistry, _Abs('/src/a.js'), 'ComponentOne');
      addToReferencesRegistry(program, referencesRegistry, _Abs('/src/a.js'), 'ComponentTwo');

      const analyses = analyzer.analyzeProgram(program);
      expect(analyses).toEqual([{
        identifier: 'ComponentOne',
        from: _Abs('/src/a.js'),
        dtsFrom: null,
        alias: 'aliasedComponentOne',
      }]);
    });
  });
});

type Files = {
  name: AbsoluteFsPath,
  contents: string, isRoot?: boolean | undefined
}[];

function setup(jsProgram: Files, dtsProgram: Files) {
  const program = makeTestProgram(...jsProgram);
  const dts = makeTestBundleProgram(dtsProgram);
  const host = new Esm2015ReflectionHost(new MockLogger(), false, program.getTypeChecker(), dts);
  const referencesRegistry = new NgccReferencesRegistry(host);
  const analyzer = new PrivateDeclarationsAnalyzer(host, referencesRegistry);
  return {program, referencesRegistry, analyzer};
}

/**
 * Add up the named component to the references registry.
 *
 * This would normally be done by the decoration handlers in the `DecorationAnalyzer`.
 */
function addToReferencesRegistry(
    program: ts.Program, registry: NgccReferencesRegistry, fileName: AbsoluteFsPath,
    componentName: string) {
  const declaration = getDeclaration(program, fileName, componentName, ts.isClassDeclaration);
  registry.add(null !, new Reference(declaration));
}

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {ResolvedReference} from '../../../ngtsc/imports';
import {NgccReferencesRegistry} from '../../src/analysis/ngcc_references_registry';
import {PrivateDeclarationsAnalyzer} from '../../src/analysis/private_declarations_analyzer';
import {Esm2015ReflectionHost} from '../../src/host/esm2015_host';
import {getDeclaration, makeTestBundleProgram, makeTestProgram} from '../helpers/utils';

const TEST_PROGRAM = [
  {
    name: '/src/entry_point.js',
    isRoot: true,
    contents: `
    export {PublicComponent} from './a';
    export {ModuleA} from './mod';
    export {ModuleB} from './b';
  `
  },
  {
    name: '/src/a.js',
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
    name: '/src/b.js',
    isRoot: false,
    contents: `
    import {Component, NgModule} from '@angular/core';
    class PrivateComponent {}
    PrivateComponent.decorators = [
      {type: Component, args: [{selectors: 'b', template: ''}]}
    ];
    export class ModuleB {}
    ModuleB.decorators = [
      {type: NgModule, args: [{declarations: [PrivateComponent]}]}
    ];
  `
  },
  {
    name: '/src/c.js',
    isRoot: false,
    contents: `
    import {Component} from '@angular/core';
    export class InternalComponent {}
    InternalComponent.decorators = [
      {type: Component, args: [{selectors: 'c', template: ''}]}
    ];
  `
  },
  {
    name: '/src/mod.js',
    isRoot: false,
    contents: `
    import {Component, NgModule} from '@angular/core';
    import {PublicComponent} from './a';
    import {ModuleB} from './b';
    import {InternalComponent} from './c';
    export class ModuleA {}
    ModuleA.decorators = [
      {type: NgModule, args: [{
        declarations: [PublicComponent, InternalComponent],
        imports: [ModuleB]
      }]}
    ];
  `
  }
];
const TEST_DTS_PROGRAM = [
  {
    name: '/typings/entry_point.d.ts',
    isRoot: true,
    contents: `
    export {PublicComponent} from './a';
    export {ModuleA} from './mod';
    export {ModuleB} from './b';
  `
  },
  {
    name: '/typings/a.d.ts',
    isRoot: false,
    contents: `
    export declare class PublicComponent {}
  `
  },
  {
    name: '/typings/b.d.ts',
    isRoot: false,
    contents: `
    export declare class ModuleB {}
  `
  },
  {
    name: '/typings/c.d.ts',
    isRoot: false,
    contents: `
    export declare class InternalComponent {}
  `
  },
  {
    name: '/typings/mod.d.ts',
    isRoot: false,
    contents: `
    import {PublicComponent} from './a';
    import {ModuleB} from './b';
    import {InternalComponent} from './c';
    export declare class ModuleA {}
  `
  },
];

describe('PrivateDeclarationsAnalyzer', () => {
  describe('analyzeProgram()', () => {
    it('should find all NgModule declarations that were not publicly exported from the entry-point',
       () => {
         const program = makeTestProgram(...TEST_PROGRAM);
         const dts = makeTestBundleProgram(TEST_DTS_PROGRAM);
         const host = new Esm2015ReflectionHost(false, program.getTypeChecker(), dts);
         const referencesRegistry = new NgccReferencesRegistry(host);
         const analyzer = new PrivateDeclarationsAnalyzer(host, referencesRegistry);

         // Set up the registry with references - this would normally be done by the
         // decoration handlers in the `DecorationAnalyzer`.
         const publicComponentDeclaration =
             getDeclaration(program, '/src/a.js', 'PublicComponent', ts.isClassDeclaration);
         referencesRegistry.add(
             null !,
             new ResolvedReference(publicComponentDeclaration, publicComponentDeclaration.name !));
         const privateComponentDeclaration =
             getDeclaration(program, '/src/b.js', 'PrivateComponent', ts.isClassDeclaration);
         referencesRegistry.add(
             null !, new ResolvedReference(
                         privateComponentDeclaration, privateComponentDeclaration.name !));
         const internalComponentDeclaration =
             getDeclaration(program, '/src/c.js', 'InternalComponent', ts.isClassDeclaration);
         referencesRegistry.add(
             null !, new ResolvedReference(
                         internalComponentDeclaration, internalComponentDeclaration.name !));

         const analyses = analyzer.analyzeProgram(program);
         expect(analyses.length).toEqual(2);
         expect(analyses).toEqual([
           {identifier: 'PrivateComponent', from: '/src/b.js', dtsFrom: null},
           {identifier: 'InternalComponent', from: '/src/c.js', dtsFrom: '/typings/c.d.ts'},
         ]);
       });
  });
});

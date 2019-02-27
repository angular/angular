/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {LocalIdentifierStrategy, ReferenceEmitter} from '../../imports';
import {PartialEvaluator} from '../../partial_evaluator';
import {TypeScriptReflectionHost} from '../../reflection';
import {LocalModuleScopeRegistry, MetadataDtsModuleScopeResolver} from '../../scope';
import {getDeclaration, makeProgram} from '../../testing/in_memory_typescript';
import {NgModuleDecoratorHandler} from '../src/ng_module';
import {NoopReferencesRegistry} from '../src/references_registry';

describe('NgModuleDecoratorHandler', () => {
  it('should resolve forwardRef', () => {
    const {program} = makeProgram([
      {
        name: 'node_modules/@angular/core/index.d.ts',
        contents: `
         export const Component: any;
         export const NgModule: any;
         export declare function forwardRef(fn: () => any): any;
       `,
      },
      {
        name: 'entry.ts',
        contents: `
         import {Component, forwardRef, NgModule} from '@angular/core';
          @Component({
           template: '',
         })
         export class TestComp {}
          @NgModule({
           declarations: [forwardRef(() => TestComp)]
         })
         export class TestModule {}
       `
      },
    ]);
    const checker = program.getTypeChecker();
    const reflectionHost = new TypeScriptReflectionHost(checker);
    const evaluator = new PartialEvaluator(reflectionHost, checker);
    const referencesRegistry = new NoopReferencesRegistry();
    const scopeRegistry = new LocalModuleScopeRegistry(
        new MetadataDtsModuleScopeResolver(checker, reflectionHost, null), new ReferenceEmitter([]),
        null);
    const refEmitter = new ReferenceEmitter([new LocalIdentifierStrategy()]);

    const handler = new NgModuleDecoratorHandler(
        reflectionHost, evaluator, scopeRegistry, referencesRegistry, false, null, refEmitter);
    const TestComp = getDeclaration(program, 'entry.ts', 'TestComp', ts.isClassDeclaration);
    const TestModule = getDeclaration(program, 'entry.ts', 'TestModule', ts.isClassDeclaration);
    const detected =
        handler.detect(TestModule, reflectionHost.getDecoratorsOfDeclaration(TestModule));
    if (detected === undefined) {
      return fail('Failed to recognize @NgModule');
    }
    const analysis = handler.analyze(TestModule, detected.metadata).analysis !;

    expect(analysis.declarations.map(reference => reference.node)).toEqual([TestComp]);
  });
});
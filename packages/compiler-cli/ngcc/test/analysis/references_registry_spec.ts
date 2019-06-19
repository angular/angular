/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {Reference} from '../../../src/ngtsc/imports';
import {PartialEvaluator} from '../../../src/ngtsc/partial_evaluator';
import {TypeScriptReflectionHost} from '../../../src/ngtsc/reflection';
import {getDeclaration, makeProgram} from '../../../src/ngtsc/testing/in_memory_typescript';
import {NgccReferencesRegistry} from '../../src/analysis/ngcc_references_registry';

describe('NgccReferencesRegistry', () => {
  it('should return a mapping from resolved reference identifiers to their declarations', () => {
    const {program, options, host} = makeProgram([{
      name: 'index.ts',
      contents: `
        export class SomeClass {}
        export function someFunction() {}
        export const someVariable = 42;

        export const testArray = [SomeClass, someFunction, someVariable];
        `
    }]);

    const checker = program.getTypeChecker();

    const testArrayDeclaration =
        getDeclaration(program, 'index.ts', 'testArray', ts.isVariableDeclaration);
    const someClassDecl = getDeclaration(program, 'index.ts', 'SomeClass', ts.isClassDeclaration);
    const someFunctionDecl =
        getDeclaration(program, 'index.ts', 'someFunction', ts.isFunctionDeclaration);
    const someVariableDecl =
        getDeclaration(program, 'index.ts', 'someVariable', ts.isVariableDeclaration);
    const testArrayExpression = testArrayDeclaration.initializer !;

    const reflectionHost = new TypeScriptReflectionHost(checker);
    const evaluator = new PartialEvaluator(reflectionHost, checker);
    const registry = new NgccReferencesRegistry(reflectionHost);

    const references = (evaluator.evaluate(testArrayExpression) as any[])
                           .filter(ref => ref instanceof Reference) as Reference<ts.Declaration>[];
    registry.add(null !, ...references);

    const map = registry.getDeclarationMap();
    expect(map.size).toEqual(2);
    expect(map.get(someClassDecl.name !) !.node).toBe(someClassDecl);
    expect(map.get(someFunctionDecl.name !) !.node).toBe(someFunctionDecl);
    expect(map.has(someVariableDecl.name as ts.Identifier)).toBe(false);
  });
});

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';

import {absoluteFrom} from '../../../src/ngtsc/file_system';
import {runInEachFileSystem, TestFile} from '../../../src/ngtsc/file_system/testing';
import {Reference} from '../../../src/ngtsc/imports';
import {PartialEvaluator} from '../../../src/ngtsc/partial_evaluator';
import {DeclarationNode, TypeScriptReflectionHost} from '../../../src/ngtsc/reflection';
import {getDeclaration, loadTestFiles} from '../../../src/ngtsc/testing';
import {NgccReferencesRegistry} from '../../src/analysis/ngcc_references_registry';
import {makeTestBundleProgram} from '../helpers/utils';

runInEachFileSystem(() => {
  describe('NgccReferencesRegistry', () => {
    it('should return a mapping from resolved reference identifiers to their declarations', () => {
      const _ = absoluteFrom;
      const TEST_FILES: TestFile[] = [{
        name: _('/index.ts'),
        contents: `
        export class SomeClass {}
        export function someFunction() {}
        export const someVariable = 42;

        export const testArray = [SomeClass, someFunction, someVariable];
        `
      }];
      loadTestFiles(TEST_FILES);
      const {program} = makeTestBundleProgram(TEST_FILES[0].name);

      const checker = program.getTypeChecker();

      const indexPath = _('/index.ts');
      const testArrayDeclaration =
          getDeclaration(program, indexPath, 'testArray', ts.isVariableDeclaration);
      const someClassDecl = getDeclaration(program, indexPath, 'SomeClass', ts.isClassDeclaration);
      const someFunctionDecl =
          getDeclaration(program, indexPath, 'someFunction', ts.isFunctionDeclaration);
      const someVariableDecl =
          getDeclaration(program, indexPath, 'someVariable', ts.isVariableDeclaration);
      const testArrayExpression = testArrayDeclaration.initializer!;

      const reflectionHost = new TypeScriptReflectionHost(checker);
      const evaluator = new PartialEvaluator(reflectionHost, checker, /* dependencyTracker */ null);
      const registry = new NgccReferencesRegistry(reflectionHost);

      const references = (evaluator.evaluate(testArrayExpression) as any[]).filter(isReference);
      registry.add(null!, ...references);

      const map = registry.getDeclarationMap();
      expect(map.size).toEqual(2);
      expect(map.get(someClassDecl.name!)!.node).toBe(someClassDecl);
      expect(map.get(someFunctionDecl.name!)!.node).toBe(someFunctionDecl);
      expect(map.has(someVariableDecl.name as ts.Identifier)).toBe(false);
    });
  });

  function isReference(ref: any): ref is Reference<DeclarationNode> {
    return ref instanceof Reference;
  }
});

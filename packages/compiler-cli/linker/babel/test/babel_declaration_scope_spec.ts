/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {parse} from '@babel/parser';
import traverse, {NodePath} from '@babel/traverse';
import * as t from '@babel/types';
import {BabelDeclarationScope} from '../src/babel_declaration_scope';

describe('BabelDeclarationScope', () => {
  describe('getConstantScopeRef()', () => {
    it('should return a path to the ES module where the expression was imported', () => {
      const ast = parse(
          [
            'import * as core from \'@angular/core\';',
            'function foo() {',
            '  var TEST = core;',
            '}',
          ].join('\n'),
          {sourceType: 'module'});
      const nodePath = findVarDeclaration(ast, 'TEST');
      const scope = new BabelDeclarationScope(nodePath.scope);
      const constantScope = scope.getConstantScopeRef(nodePath.get('init').node);
      expect(constantScope).not.toBe(null);
      expect(constantScope!.node).toBe(ast.program);
    });

    it('should return a path to the ES Module where the expression is declared', () => {
      const ast = parse(
          [
            'var core;',
            'export function foo() {',
            '  var TEST = core;',
            '}',
          ].join('\n'),
          {sourceType: 'module'});
      const nodePath = findVarDeclaration(ast, 'TEST');
      const scope = new BabelDeclarationScope(nodePath.scope);
      const constantScope = scope.getConstantScopeRef(nodePath.get('init').node);
      expect(constantScope).not.toBe(null);
      expect(constantScope!.node).toBe(ast.program);
    });

    it('should return null if the file is not an ES module', () => {
      const ast = parse(
          [
            'var core;',
            'function foo() {',
            '  var TEST = core;',
            '}',
          ].join('\n'),
          {sourceType: 'script'});
      const nodePath = findVarDeclaration(ast, 'TEST');
      const scope = new BabelDeclarationScope(nodePath.scope);
      const constantScope = scope.getConstantScopeRef(nodePath.get('init').node);
      expect(constantScope).toBe(null);
    });

    it('should return the IIFE factory function where the expression is a parameter', () => {
      const ast = parse(
          [
            'var core;',
            '(function(core) {',
            '  var BLOCK = \'block\';',
            '  function foo() {',
            '    var TEST = core;',
            '  }',
            '})(core);',
          ].join('\n'),
          {sourceType: 'script'});
      const nodePath = findVarDeclaration(ast, 'TEST');
      const fnPath = findFirstFunction(ast);
      const scope = new BabelDeclarationScope(nodePath.scope);
      const constantScope = scope.getConstantScopeRef(nodePath.get('init').node);
      expect(constantScope).not.toBe(null);
      expect(constantScope!.isFunction()).toBe(true);
      expect(constantScope!.node).toEqual(fnPath.node);
    });
  });
});

/**
 * The type of a variable declarator that is known to have an initializer.
 *
 * Note: the `init` property is explicitly omitted to workaround a performance cliff in the
 * TypeScript type checker.
 */
type InitializedVariableDeclarator = Omit<t.VariableDeclarator, 'init'>&{init: t.Expression};

function findVarDeclaration(
    file: t.File, varName: string): NodePath<InitializedVariableDeclarator> {
  let varDecl: NodePath<t.VariableDeclarator>|undefined = undefined;
  traverse(file, {
    VariableDeclarator: (path: NodePath<t.VariableDeclarator>) => {
      const id = path.get('id');
      if (id.isIdentifier() && id.node.name === varName && path.get('init') !== null) {
        varDecl = path;
        path.stop();
      }
    }
  });
  if (varDecl === undefined) {
    throw new Error(`TEST BUG: expected to find variable declaration for ${varName}.`);
  }
  return varDecl;
}

function findFirstFunction(file: t.File): NodePath<t.Function> {
  let fn: NodePath<t.Function>|undefined = undefined;
  traverse(file, {
    Function: (path) => {
      fn = path;
      path.stop();
    }
  });
  if (fn === undefined) {
    throw new Error(`TEST BUG: expected to find a function.`);
  }
  return fn;
}

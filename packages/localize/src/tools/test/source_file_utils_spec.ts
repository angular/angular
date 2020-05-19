/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ɵmakeTemplateObject} from '@angular/localize';
import {NodePath, TransformOptions, transformSync} from '@babel/core';
import generate from '@babel/generator';

import template from '@babel/template';
import {Expression, Identifier, TaggedTemplateExpression, ExpressionStatement, FunctionDeclaration, CallExpression, isParenthesizedExpression, numericLiteral, binaryExpression, NumericLiteral} from '@babel/types';
import {isGlobalIdentifier, isNamedIdentifier, isStringLiteralArray, isArrayOfExpressions, unwrapStringLiteralArray, unwrapMessagePartsFromLocalizeCall, wrapInParensIfNecessary, buildLocalizeReplacement, unwrapSubstitutionsFromLocalizeCall, unwrapMessagePartsFromTemplateLiteral, getLocation} from '../src/source_file_utils';

describe('utils', () => {
  describe('isNamedIdentifier()', () => {
    it('should return true if the expression is an identifier with name `$localize`', () => {
      const taggedTemplate = getTaggedTemplate('$localize ``;');
      expect(isNamedIdentifier(taggedTemplate.get('tag'), '$localize')).toBe(true);
    });

    it('should return false if the expression is an identifier without the name `$localize`',
       () => {
         const taggedTemplate = getTaggedTemplate('other ``;');
         expect(isNamedIdentifier(taggedTemplate.get('tag'), '$localize')).toBe(false);
       });

    it('should return false if the expression is not an identifier', () => {
      const taggedTemplate = getTaggedTemplate('$localize() ``;');
      expect(isNamedIdentifier(taggedTemplate.get('tag'), '$localize')).toBe(false);
    });
  });

  describe('isGlobalIdentifier()', () => {
    it('should return true if the identifier is at the top level and not declared', () => {
      const taggedTemplate = getTaggedTemplate('$localize ``;');
      expect(isGlobalIdentifier(taggedTemplate.get('tag') as NodePath<Identifier>)).toBe(true);
    });

    it('should return true if the identifier is in a block scope and not declared', () => {
      const taggedTemplate = getTaggedTemplate('function foo() { $localize ``; } foo();');
      expect(isGlobalIdentifier(taggedTemplate.get('tag') as NodePath<Identifier>)).toBe(true);
    });

    it('should return false if the identifier is declared locally', () => {
      const taggedTemplate = getTaggedTemplate('function $localize() {} $localize ``;');
      expect(isGlobalIdentifier(taggedTemplate.get('tag') as NodePath<Identifier>)).toBe(false);
    });

    it('should return false if the identifier is a function parameter', () => {
      const taggedTemplate = getTaggedTemplate('function foo($localize) { $localize ``; }');
      expect(isGlobalIdentifier(taggedTemplate.get('tag') as NodePath<Identifier>)).toBe(false);
    });
  });

  describe('buildLocalizeReplacement', () => {
    it('should interleave the `messageParts` with the `substitutions`', () => {
      const messageParts = ɵmakeTemplateObject(['a', 'b', 'c'], ['a', 'b', 'c']);
      const substitutions = [numericLiteral(1), numericLiteral(2)];
      const expression = buildLocalizeReplacement(messageParts, substitutions);
      expect(generate(expression).code).toEqual('"a" + 1 + "b" + 2 + "c"');
    });

    it('should wrap "binary expression" substitutions in parentheses', () => {
      const messageParts = ɵmakeTemplateObject(['a', 'b'], ['a', 'b']);
      const binary = binaryExpression('+', numericLiteral(1), numericLiteral(2));
      const expression = buildLocalizeReplacement(messageParts, [binary]);
      expect(generate(expression).code).toEqual('"a" + (1 + 2) + "b"');
    });
  });

  describe('unwrapMessagePartsFromLocalizeCall', () => {
    it('should return an array of string literals from a direct call to a tag function', () => {
      const localizeCall = getLocalizeCall(`$localize(['a', 'b\\t', 'c'], 1, 2)`);
      const parts = unwrapMessagePartsFromLocalizeCall(localizeCall);
      expect(parts).toEqual(['a', 'b\t', 'c']);
    });

    it('should return an array of string literals from a downleveled tagged template', () => {
      let localizeCall = getLocalizeCall(
          `$localize(__makeTemplateObject(['a', 'b\\t', 'c'], ['a', 'b\\\\t', 'c']), 1, 2)`);
      const parts = unwrapMessagePartsFromLocalizeCall(localizeCall);
      expect(parts).toEqual(['a', 'b\t', 'c']);
      expect(parts.raw).toEqual(['a', 'b\\t', 'c']);
    });

    it('should return an array of string literals from a lazy load template helper', () => {
      let localizeCall = getLocalizeCall(`
        function _templateObject() {
          var e = _taggedTemplateLiteral(['a', 'b', 'c'], ['a', 'b', 'c']);
          return _templateObject = function() { return e }, e
        }
        $localize(_templateObject(), 1, 2)`);
      const parts = unwrapMessagePartsFromLocalizeCall(localizeCall);
      expect(parts).toEqual(['a', 'b', 'c']);
      expect(parts.raw).toEqual(['a', 'b', 'c']);
    });

    it('should remove a lazy load template helper', () => {
      let localizeCall = getLocalizeCall(`
        function _templateObject() {
          var e = _taggedTemplateLiteral(['a', 'b', 'c'], ['a', 'b', 'c']);
          return _templateObject = function() { return e }, e
        }
        $localize(_templateObject(), 1, 2)`);
      const localizeStatement = localizeCall.parentPath as NodePath<ExpressionStatement>;
      const statements = localizeStatement.container as object[];
      expect(statements.length).toEqual(2);
      unwrapMessagePartsFromLocalizeCall(localizeCall);
      expect(statements.length).toEqual(1);
      expect(statements[0]).toBe(localizeStatement.node);
    });
  });

  describe('unwrapSubstitutionsFromLocalizeCall', () => {
    it('should return the substitutions from a direct call to a tag function', () => {
      const ast = template.ast`$localize(['a', 'b\t', 'c'], 1, 2)` as ExpressionStatement;
      const call = ast.expression as CallExpression;
      const substitutions = unwrapSubstitutionsFromLocalizeCall(call);
      expect(substitutions.map(s => (s as NumericLiteral).value)).toEqual([1, 2]);
    });

    it('should return the substitutions from a downleveled tagged template', () => {
      const ast = template.ast
      `$localize(__makeTemplateObject(['a', 'b', 'c'], ['a', 'b', 'c']), 1, 2)` as
          ExpressionStatement;
      const call = ast.expression as CallExpression;
      const substitutions = unwrapSubstitutionsFromLocalizeCall(call);
      expect(substitutions.map(s => (s as NumericLiteral).value)).toEqual([1, 2]);
    });
  });

  describe('unwrapMessagePartsFromTemplateLiteral', () => {
    it('should return a TemplateStringsArray built from the template literal elements', () => {
      const taggedTemplate = getTaggedTemplate('$localize `a${1}b\\t${2}c`;');
      expect(unwrapMessagePartsFromTemplateLiteral(taggedTemplate.node.quasi.quasis))
          .toEqual(ɵmakeTemplateObject(['a', 'b\t', 'c'], ['a', 'b\\t', 'c']));
    });
  });

  describe('wrapInParensIfNecessary', () => {
    it('should wrap the expression in parentheses if it is binary', () => {
      const ast = template.ast`a + b` as ExpressionStatement;
      const wrapped = wrapInParensIfNecessary(ast.expression);
      expect(isParenthesizedExpression(wrapped)).toBe(true);
    });

    it('should return the expression untouched if it is not binary', () => {
      const ast = template.ast`a` as ExpressionStatement;
      const wrapped = wrapInParensIfNecessary(ast.expression);
      expect(isParenthesizedExpression(wrapped)).toBe(false);
    });
  });

  describe('unwrapStringLiteralArray', () => {
    it('should return an array of string from an array expression', () => {
      const ast = template.ast`['a', 'b', 'c']` as ExpressionStatement;
      expect(unwrapStringLiteralArray(ast.expression)).toEqual(['a', 'b', 'c']);
    });

    it('should throw an error if any elements of the array are not literal strings', () => {
      const ast = template.ast`['a', 2, 'c']` as ExpressionStatement;
      expect(() => unwrapStringLiteralArray(ast.expression))
          .toThrowError('Unexpected messageParts for `$localize` (expected an array of strings).');
    });
  });

  describe('isStringLiteralArray()', () => {
    it('should return true if the ast is an array of strings', () => {
      const ast = template.ast`['a', 'b', 'c']` as ExpressionStatement;
      expect(isStringLiteralArray(ast.expression)).toBe(true);
    });

    it('should return false if the ast is not an array', () => {
      const ast = template.ast`'a'` as ExpressionStatement;
      expect(isStringLiteralArray(ast.expression)).toBe(false);
    });

    it('should return false if at least on of the array elements is not a string', () => {
      const ast = template.ast`['a', 1, 'b']` as ExpressionStatement;
      expect(isStringLiteralArray(ast.expression)).toBe(false);
    });
  });

  describe('isArrayOfExpressions()', () => {
    it('should return true if all the nodes are expressions', () => {
      const ast = template.ast`function foo(a, b, c) {}` as FunctionDeclaration;
      expect(isArrayOfExpressions(ast.params)).toBe(true);
    });

    it('should return false if any of the nodes is not an expression', () => {
      const ast = template.ast`function foo(a, b, ...c) {}` as FunctionDeclaration;
      expect(isArrayOfExpressions(ast.params)).toBe(false);
    });
  });

  describe('getLocation()', () => {
    it('should return a plain object containing the start, end and file of a NodePath', () => {
      const taggedTemplate =
          getTaggedTemplate('const x = $localize ``;', {filename: 'src/test.js'});
      const location = getLocation(taggedTemplate)!;
      expect(location).toBeDefined();
      expect(location.start).toEqual({line: 1, column: 10});
      expect(location.start.constructor.name).toEqual('Object');
      expect(location.end).toEqual({line: 1, column: 22});
      expect(location.end.constructor.name).toEqual('Object');
      expect(location.file).toContain('src/test.js');
    });

    it('should return undefined if the NodePath has no filename', () => {
      const taggedTemplate = getTaggedTemplate('const x = $localize ``;');
      const location = getLocation(taggedTemplate)!;
      expect(location).toBeUndefined();
    });
  });
});

function getTaggedTemplate(
    code: string, options?: TransformOptions): NodePath<TaggedTemplateExpression> {
  const {expressions, plugin} = collectExpressionsPlugin();
  transformSync(code, {...options, plugins: [plugin]});
  return expressions.find(e => e.isTaggedTemplateExpression()) as any;
}

function collectExpressionsPlugin() {
  const expressions: NodePath<Expression>[] = [];
  const visitor = {
    Expression: (path: NodePath<Expression>) => {
      expressions.push(path);
    }
  };
  return {expressions, plugin: {visitor}};
}

function getLocalizeCall(code: string): NodePath<CallExpression> {
  let callPaths: NodePath<CallExpression>[] = [];
  transformSync(code, {
    plugins: [{
      visitor: {
        CallExpression(path) {
          callPaths.push(path);
        }
      }
    }]
  });
  const localizeCall = callPaths.find(p => {
    const callee = p.get('callee');
    return (callee.isIdentifier() && callee.node.name === '$localize');
  });
  if (!localizeCall) {
    throw new Error(`$localize cannot be found in ${code}`);
  }
  return localizeCall;
}

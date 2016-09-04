/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ASTWithSource, BindingPipe, Interpolation, ParserError, TemplateBinding} from '@angular/compiler/src/expression_parser/ast';
import {Lexer} from '@angular/compiler/src/expression_parser/lexer';
import {Parser, TemplateBindingParseResult} from '@angular/compiler/src/expression_parser/parser';
import {expect} from '@angular/platform-browser/testing/matchers';

import {isBlank, isPresent} from '../../src/facade/lang';

import {unparse} from './unparser';
import {validate} from './validator';

export function main() {
  function createParser() { return new Parser(new Lexer()); }

  function parseAction(text: string, location: any = null): ASTWithSource {
    return createParser().parseAction(text, location);
  }

  function parseBinding(text: string, location: any = null): ASTWithSource {
    return createParser().parseBinding(text, location);
  }

  function parseTemplateBindingsResult(
      text: string, location: any = null): TemplateBindingParseResult {
    return createParser().parseTemplateBindings(text, location);
  }
  function parseTemplateBindings(text: string, location: any = null): TemplateBinding[] {
    return parseTemplateBindingsResult(text, location).templateBindings;
  }

  function parseInterpolation(text: string, location: any = null): ASTWithSource {
    return createParser().parseInterpolation(text, location);
  }

  function parseSimpleBinding(text: string, location: any = null): ASTWithSource {
    return createParser().parseSimpleBinding(text, location);
  }

  function checkInterpolation(exp: string, expected?: string) {
    var ast = parseInterpolation(exp);
    if (isBlank(expected)) expected = exp;
    expect(unparse(ast)).toEqual(expected);
    validate(ast);
  }

  function checkBinding(exp: string, expected?: string) {
    var ast = parseBinding(exp);
    if (isBlank(expected)) expected = exp;
    expect(unparse(ast)).toEqual(expected);
    validate(ast);
  }

  function checkAction(exp: string, expected?: string) {
    var ast = parseAction(exp);
    if (isBlank(expected)) expected = exp;
    expect(unparse(ast)).toEqual(expected);
    validate(ast);
  }

  function expectError(ast: {errors: ParserError[]}, message: string) {
    for (var error of ast.errors) {
      if (error.message.indexOf(message) >= 0) {
        return;
      }
    }
    throw Error(`Expected an error containing "${message}" to be reported`);
  }

  function expectActionError(text: string, message: string) {
    expectError(validate(parseAction(text)), message);
  }

  function expectBindingError(text: string, message: string) {
    expectError(validate(parseBinding(text)), message);
  }

  describe('parser', () => {
    describe('parseAction', () => {
      it('should parse numbers', () => { checkAction('1'); });

      it('should parse strings', () => {
        checkAction('\'1\'', '"1"');
        checkAction('"1"');
      });

      it('should parse null', () => { checkAction('null'); });

      it('should parse undefined', () => { checkAction('undefined'); });

      it('should parse unary - expressions', () => {
        checkAction('-1', '0 - 1');
        checkAction('+1', '1');
      });

      it('should parse unary ! expressions', () => {
        checkAction('!true');
        checkAction('!!true');
        checkAction('!!!true');
      });

      it('should parse multiplicative expressions',
         () => { checkAction('3*4/2%5', '3 * 4 / 2 % 5'); });

      it('should parse additive expressions', () => { checkAction('3 + 6 - 2'); });

      it('should parse relational expressions', () => {
        checkAction('2 < 3');
        checkAction('2 > 3');
        checkAction('2 <= 2');
        checkAction('2 >= 2');
      });

      it('should parse equality expressions', () => {
        checkAction('2 == 3');
        checkAction('2 != 3');
      });

      it('should parse strict equality expressions', () => {
        checkAction('2 === 3');
        checkAction('2 !== 3');
      });

      it('should parse expressions', () => {
        checkAction('true && true');
        checkAction('true || false');
      });

      it('should parse grouped expressions', () => { checkAction('(1 + 2) * 3', '1 + 2 * 3'); });

      it('should ignore comments in expressions', () => { checkAction('a //comment', 'a'); });

      it('should retain // in string literals',
         () => { checkAction(`"http://www.google.com"`, `"http://www.google.com"`); });

      it('should parse an empty string', () => { checkAction(''); });

      describe('literals', () => {
        it('should parse array', () => {
          checkAction('[1][0]');
          checkAction('[[1]][0][0]');
          checkAction('[]');
          checkAction('[].length');
          checkAction('[1, 2].length');
        });

        it('should parse map', () => {
          checkAction('{}');
          checkAction('{a: 1}[2]');
          checkAction('{}["a"]');
        });

        it('should only allow identifier, string, or keyword as map key', () => {
          expectActionError('{(:0}', 'expected identifier, keyword, or string');
          expectActionError('{1234:0}', 'expected identifier, keyword, or string');
        });
      });

      describe('member access', () => {
        it('should parse field access', () => {
          checkAction('a');
          checkAction('this.a', 'a');
          checkAction('a.a');
        });

        it('should only allow identifier or keyword as member names', () => {
          expectActionError('x.(', 'identifier or keyword');
          expectActionError('x. 1234', 'identifier or keyword');
          expectActionError('x."foo"', 'identifier or keyword');
        });

        it('should parse safe field access', () => {
          checkAction('a?.a');
          checkAction('a.a?.a');
        });
      });

      describe('method calls', () => {
        it('should parse method calls', () => {
          checkAction('fn()');
          checkAction('add(1, 2)');
          checkAction('a.add(1, 2)');
          checkAction('fn().add(1, 2)');
        });
      });

      describe('functional calls', () => {
        it('should parse function calls', () => { checkAction('fn()(1, 2)'); });
      });

      describe('conditional', () => {
        it('should parse ternary/conditional expressions', () => {
          checkAction('7 == 3 + 4 ? 10 : 20');
          checkAction('false ? 10 : 20');
        });

        it('should report incorrect ternary operator syntax', () => {
          expectActionError('true?1', 'Conditional expression true?1 requires all 3 expressions');
        });
      });

      describe('assignment', () => {
        it('should support field assignments', () => {
          checkAction('a = 12');
          checkAction('a.a.a = 123');
          checkAction('a = 123; b = 234;');
        });

        it('should report on safe field assignments',
           () => { expectActionError('a?.a = 123', 'cannot be used in the assignment'); });

        it('should support array updates', () => { checkAction('a[0] = 200'); });
      });

      it('should error when using pipes',
         () => { expectActionError('x|blah', 'Cannot have a pipe'); });

      it('should store the source in the result',
         () => { expect(parseAction('someExpr', 'someExpr')); });

      it('should store the passed-in location',
         () => { expect(parseAction('someExpr', 'location').location).toBe('location'); });

      it('should report when encountering interpolation', () => {
        expectActionError('{{a()}}', 'Got interpolation ({{}}) where expression was expected');
      });
    });

    describe('general error handling', () => {
      it('should report an unexpected token',
         () => { expectActionError('[1,2] trac', 'Unexpected token \'trac\''); });

      it('should report reasonable error for unconsumed tokens',
         () => { expectActionError(')', 'Unexpected token ) at column 1 in [)]'); });

      it('should report a missing expected token', () => {
        expectActionError('a(b', 'Missing expected ) at the end of the expression [a(b]');
      });
    });

    describe('parseBinding', () => {
      describe('pipes', () => {
        it('should parse pipes', () => {
          checkBinding('a(b | c)', 'a((b | c))');
          checkBinding('a.b(c.d(e) | f)', 'a.b((c.d(e) | f))');
          checkBinding('[1, 2, 3] | a', '([1, 2, 3] | a)');
          checkBinding('{a: 1} | b', '({a: 1} | b)');
          checkBinding('a[b] | c', '(a[b] | c)');
          checkBinding('a?.b | c', '(a?.b | c)');
          checkBinding('true | a', '(true | a)');
          checkBinding('a | b:c | d', '((a | b:c) | d)');
          checkBinding('a | b:(c | d)', '(a | b:(c | d))');
        });

        it('should only allow identifier or keyword as formatter names', () => {
          expectBindingError('"Foo"|(', 'identifier or keyword');
          expectBindingError('"Foo"|1234', 'identifier or keyword');
          expectBindingError('"Foo"|"uppercase"', 'identifier or keyword');
        });

        it('should parse quoted expressions', () => { checkBinding('a:b', 'a:b'); });

        it('should not crash when prefix part is not tokenizable',
           () => { checkBinding('"a:b"', '"a:b"'); });

        it('should ignore whitespace around quote prefix', () => { checkBinding(' a :b', 'a:b'); });

        it('should refuse prefixes that are not single identifiers', () => {
          expectBindingError('a + b:c', '');
          expectBindingError('1:c', '');
        });
      });

      it('should store the source in the result',
         () => { expect(parseBinding('someExpr').source).toBe('someExpr'); });

      it('should store the passed-in location',
         () => { expect(parseBinding('someExpr', 'location').location).toBe('location'); });

      it('should report chain expressions',
         () => { expectError(parseBinding('1;2'), 'contain chained expression'); });

      it('should report assignment',
         () => { expectError(parseBinding('a=2'), 'contain assignments'); });

      it('should report when encountering interpolation', () => {
        expectBindingError('{{a.b}}', 'Got interpolation ({{}}) where expression was expected');
      });

      it('should parse conditional expression', () => { checkBinding('a < b ? a : b'); });

      it('should ignore comments in bindings', () => { checkBinding('a //comment', 'a'); });

      it('should retain // in string literals',
         () => { checkBinding(`"http://www.google.com"`, `"http://www.google.com"`); });

      it('should retain // in : microsyntax', () => { checkBinding('one:a//b', 'one:a//b'); });

    });

    describe('parseTemplateBindings', () => {

      function keys(templateBindings: any[]) {
        return templateBindings.map(binding => binding.key);
      }

      function keyValues(templateBindings: any[]) {
        return templateBindings.map(binding => {
          if (binding.keyIsVar) {
            return 'let ' + binding.key + (isBlank(binding.name) ? '=null' : '=' + binding.name);
          } else {
            return binding.key + (isBlank(binding.expression) ? '' : `=${binding.expression}`);
          }
        });
      }

      function exprSources(templateBindings: any[]) {
        return templateBindings.map(
            binding => isPresent(binding.expression) ? binding.expression.source : null);
      }

      it('should parse an empty string', () => { expect(parseTemplateBindings('')).toEqual([]); });

      it('should parse a string without a value',
         () => { expect(keys(parseTemplateBindings('a'))).toEqual(['a']); });

      it('should only allow identifier, string, or keyword including dashes as keys', () => {
        var bindings = parseTemplateBindings('a:\'b\'');
        expect(keys(bindings)).toEqual(['a']);

        bindings = parseTemplateBindings('\'a\':\'b\'');
        expect(keys(bindings)).toEqual(['a']);

        bindings = parseTemplateBindings('"a":\'b\'');
        expect(keys(bindings)).toEqual(['a']);

        bindings = parseTemplateBindings('a-b:\'c\'');
        expect(keys(bindings)).toEqual(['a-b']);

        expectError(parseTemplateBindingsResult('(:0'), 'expected identifier, keyword, or string');

        expectError(
            parseTemplateBindingsResult('1234:0'), 'expected identifier, keyword, or string');
      });

      it('should detect expressions as value', () => {
        var bindings = parseTemplateBindings('a:b');
        expect(exprSources(bindings)).toEqual(['b']);

        bindings = parseTemplateBindings('a:1+1');
        expect(exprSources(bindings)).toEqual(['1+1']);
      });

      it('should detect names as value', () => {
        var bindings = parseTemplateBindings('a:let b');
        expect(keyValues(bindings)).toEqual(['a', 'let b=\$implicit']);
      });

      it('should allow space and colon as separators', () => {
        var bindings = parseTemplateBindings('a:b');
        expect(keys(bindings)).toEqual(['a']);
        expect(exprSources(bindings)).toEqual(['b']);

        bindings = parseTemplateBindings('a b');
        expect(keys(bindings)).toEqual(['a']);
        expect(exprSources(bindings)).toEqual(['b']);
      });

      it('should allow multiple pairs', () => {
        var bindings = parseTemplateBindings('a 1 b 2');
        expect(keys(bindings)).toEqual(['a', 'aB']);
        expect(exprSources(bindings)).toEqual(['1 ', '2']);
      });

      it('should store the sources in the result', () => {
        var bindings = parseTemplateBindings('a 1,b 2');
        expect(bindings[0].expression.source).toEqual('1');
        expect(bindings[1].expression.source).toEqual('2');
      });

      it('should store the passed-in location', () => {
        var bindings = parseTemplateBindings('a 1,b 2', 'location');
        expect(bindings[0].expression.location).toEqual('location');
      });

      it('should support let notation', () => {
        var bindings = parseTemplateBindings('let i');
        expect(keyValues(bindings)).toEqual(['let i=\$implicit']);

        bindings = parseTemplateBindings('let i');
        expect(keyValues(bindings)).toEqual(['let i=\$implicit']);

        bindings = parseTemplateBindings('let a; let b');
        expect(keyValues(bindings)).toEqual(['let a=\$implicit', 'let b=\$implicit']);

        bindings = parseTemplateBindings('let a; let b;');
        expect(keyValues(bindings)).toEqual(['let a=\$implicit', 'let b=\$implicit']);

        bindings = parseTemplateBindings('let i-a = k-a');
        expect(keyValues(bindings)).toEqual(['let i-a=k-a']);

        bindings = parseTemplateBindings('keyword let item; let i = k');
        expect(keyValues(bindings)).toEqual(['keyword', 'let item=\$implicit', 'let i=k']);

        bindings = parseTemplateBindings('keyword: let item; let i = k');
        expect(keyValues(bindings)).toEqual(['keyword', 'let item=\$implicit', 'let i=k']);

        bindings = parseTemplateBindings('directive: let item in expr; let a = b', 'location');
        expect(keyValues(bindings)).toEqual([
          'directive', 'let item=\$implicit', 'directiveIn=expr in location', 'let a=b'
        ]);
      });

      it('should parse pipes', () => {
        var bindings = parseTemplateBindings('key value|pipe');
        var ast = bindings[0].expression.ast;
        expect(ast).toBeAnInstanceOf(BindingPipe);
      });
    });

    describe('parseInterpolation', () => {
      it('should return null if no interpolation',
         () => { expect(parseInterpolation('nothing')).toBe(null); });

      it('should parse no prefix/suffix interpolation', () => {
        var ast = parseInterpolation('{{a}}').ast as Interpolation;
        expect(ast.strings).toEqual(['', '']);
        expect(ast.expressions.length).toEqual(1);
        expect(ast.expressions[0].name).toEqual('a');
      });

      it('should parse prefix/suffix with multiple interpolation', () => {
        var originalExp = 'before {{ a }} middle {{ b }} after';
        var ast = parseInterpolation(originalExp).ast;
        expect(unparse(ast)).toEqual(originalExp);
        validate(ast);
      });

      it('should report empty interpolation expressions', () => {
        expectError(
            parseInterpolation('{{}}'),
            'Blank expressions are not allowed in interpolated strings');

        expectError(
            parseInterpolation('foo {{  }}'),
            'Parser Error: Blank expressions are not allowed in interpolated strings');
      });

      it('should parse conditional expression',
         () => { checkInterpolation('{{ a < b ? a : b }}'); });

      it('should parse expression with newline characters', () => {
        checkInterpolation(`{{ 'foo' +\n 'bar' +\r 'baz' }}`, `{{ "foo" + "bar" + "baz" }}`);
      });

      it('should support custom interpolation', () => {
        const parser = new Parser(new Lexer());
        const ast = parser.parseInterpolation('{% a %}', null, {start: '{%', end: '%}'}).ast as any;
        expect(ast.strings).toEqual(['', '']);
        expect(ast.expressions.length).toEqual(1);
        expect(ast.expressions[0].name).toEqual('a');
      });

      describe('comments', () => {
        it('should ignore comments in interpolation expressions',
           () => { checkInterpolation('{{a //comment}}', '{{ a }}'); });

        it('should retain // in single quote strings', () => {
          checkInterpolation(`{{ 'http://www.google.com' }}`, `{{ "http://www.google.com" }}`);
        });

        it('should retain // in double quote strings', () => {
          checkInterpolation(`{{ "http://www.google.com" }}`, `{{ "http://www.google.com" }}`);
        });

        it('should ignore comments after string literals',
           () => { checkInterpolation(`{{ "a//b" //comment }}`, `{{ "a//b" }}`); });

        it('should retain // in complex strings', () => {
          checkInterpolation(
              `{{"//a\'//b\`//c\`//d\'//e" //comment}}`, `{{ "//a\'//b\`//c\`//d\'//e" }}`);
        });

        it('should retain // in nested, unterminated strings',
           () => { checkInterpolation(`{{ "a\'b\`" //comment}}`, `{{ "a\'b\`" }}`); });
      });

    });

    describe('parseSimpleBinding', () => {
      it('should parse a field access', () => {
        var p = parseSimpleBinding('name');
        expect(unparse(p)).toEqual('name');
        validate(p);
      });

      it('should parse a constant', () => {
        var p = parseSimpleBinding('[1, 2]');
        expect(unparse(p)).toEqual('[1, 2]');
        validate(p);
      });

      it('should report when the given expression is not just a field name', () => {
        expectError(
            validate(parseSimpleBinding('name + 1')),
            'Host binding expression can only contain field access and constants');
      });

      it('should report when encountering interpolation', () => {
        expectError(
            validate(parseSimpleBinding('{{exp}}')),
            'Got interpolation ({{}}) where expression was expected');
      });
    });

    describe('wrapLiteralPrimitive', () => {
      it('should wrap a literal primitive', () => {
        expect(unparse(validate(createParser().wrapLiteralPrimitive('foo', null))))
            .toEqual('"foo"');
      });
    });

    describe('error recovery', () => {
      function recover(text: string, expected?: string) {
        let expr = validate(parseAction(text));
        expect(unparse(expr)).toEqual(expected || text);
      }
      it('should be able to recover from an extra paren', () => recover('((a)))', 'a'));
      it('should be able to recover from an extra bracket', () => recover('[[a]]]', '[[a]]'));
      it('should be able to recover from a missing )', () => recover('(a;b', 'a; b;'));
      it('should be able to recover from a missing ]', () => recover('[a,b', '[a, b]'));
      it('should be able to recover from a missing selector', () => recover('a.'));
      it('should be able to recover from a missing selector in a array literal',
         () => recover('[[a.], b, c]'));
    });
  });
}

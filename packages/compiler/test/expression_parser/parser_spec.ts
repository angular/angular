/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {expect} from '@angular/private/testing/matchers';
import {
  AbsoluteSourceSpan,
  ArrowFunction,
  ASTWithSource,
  BindingPipe,
  BindingPipeType,
  Call,
  EmptyExpr,
  Interpolation,
  LiteralMap,
  LiteralMapPropertyKey,
  ParseSpan,
  PropertyRead,
  TemplateBinding,
  VariableBinding,
} from '../../src/expression_parser/ast';
import {Lexer} from '../../src/expression_parser/lexer';
import {Parser, SplitInterpolation} from '../../src/expression_parser/parser';
import {ParseError} from '../../src/parse_util';

import {getFakeSpan} from './utils/span';
import {unparse, unparseWithSpan} from './utils/unparser';
import {validate} from './utils/validator';

describe('parser', () => {
  describe('parseAction', () => {
    it('should parse numbers', () => {
      checkAction('1');
    });

    it('should parse strings', () => {
      checkAction("'1'", '"1"');
      checkAction('"1"');
    });

    it('should parse null', () => {
      checkAction('null');
    });

    it('should parse undefined', () => {
      checkAction('undefined');
    });

    it('should parse unary - and + expressions', () => {
      checkAction('-1', '-1');
      checkAction('+1', '+1');
      checkAction(`-'1'`, `-"1"`);
      checkAction(`+'1'`, `+"1"`);
    });

    it('should parse unary ! expressions', () => {
      checkAction('!true');
      checkAction('!!true');
      checkAction('!!!true');
    });

    it('should parse postfix ! expression', () => {
      checkAction('true!');
      checkAction('a!.b');
      checkAction('a!!!!.b');
      checkAction('a!()');
      checkAction('a.b!()');
    });

    it('should parse exponentiation expressions', () => {
      checkAction('1*2**3', '1 * 2 ** 3');
    });

    it('should parse multiplicative expressions', () => {
      checkAction('3*4/2%5', '3 * 4 / 2 % 5');
    });

    it('should parse additive expressions', () => {
      checkAction('3 + 6 - 2');
    });

    it('should parse relational expressions', () => {
      checkAction('2 < 3');
      checkAction('2 > 3');
      checkAction('2 <= 2');
      checkAction('2 >= 2');
      checkAction(`"key" in obj`);
      checkAction(`foo instanceof Foo`);
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
      checkAction('null ?? 0');
      checkAction('null ?? undefined ?? 0');
    });

    it('should parse typeof expression', () => {
      checkAction(`typeof {} === "object"`);
      checkAction('(!(typeof {} === "number"))');
    });

    it('should parse void expression', () => {
      checkAction(`void 0`);
      checkAction('(!(void 0))');
    });

    it('should parse grouped expressions', () => {
      checkAction('(1 + 2) * 3');
    });

    it('should parse in expressions', () => {
      checkAction(`'key' in obj`, `"key" in obj`);
      checkAction(`('key' in obj) && true`, `("key" in obj) && true`);
      checkAction(`'in' in {in: foo}`, `"in" in {in: foo}`);
    });

    it('should throw on invalid in expressions', () => {
      expectActionError('in', 'Unexpected token in');
      expectActionError('in foo', 'Unexpected token in');
      expectActionError(
        `'foo' in`,
        `Unexpected end of expression: 'foo' in at the end of the expression ['foo' in]`,
      );
    });

    it('should ignore comments in expressions', () => {
      checkAction('a //comment', 'a');
    });

    it('should parse instanceof expressions', () => {
      checkAction(`obj instanceof MyClass`, `obj instanceof MyClass`);
      checkAction(`(obj instanceof MyClass) || false`, `(obj instanceof MyClass) || false`);
    });

    it('should retain // in string literals', () => {
      checkAction(`"http://www.google.com"`, `"http://www.google.com"`);
    });

    it('should parse an empty string', () => {
      checkAction('');
    });

    it('should parse assignment operators with property reads', () => {
      checkAction('a = b');
      checkAction('a += b');
      checkAction('a -= b');
      checkAction('a *= b');
      checkAction('a /= b');
      checkAction('a %= b');
      checkAction('a **= b');
      checkAction('a &&= b');
      checkAction('a ||= b');
      checkAction('a ??= b');
    });

    it('should parse assignment operators with keyed reads', () => {
      checkAction('a[0] = b');
      checkAction('a[0] += b');
      checkAction('a[0] -= b');
      checkAction('a[0] *= b');
      checkAction('a[0] /= b');
      checkAction('a[0] %= b');
      checkAction('a[0] **= b');
      checkAction('a[0] &&= b');
      checkAction('a[0] ||= b');
      checkAction('a[0] ??= b');
    });

    describe('literals', () => {
      it('should parse array', () => {
        checkAction('[1][0]');
        checkAction('[[1]][0][0]');
        checkAction('[]');
        checkAction('[].length');
        checkAction('[1, 2].length');
        checkAction('[1, 2,]', '[1, 2]');
      });

      it('should parse map', () => {
        checkAction('{}');
        checkAction('{a: 1, "b": 2}[2]');
        checkAction('{}["a"]');
        checkAction('{a: 1, b: 2,}', '{a: 1, b: 2}');
      });

      it('should only allow identifier, string, or keyword as map key', () => {
        expectActionError('{(:0}', 'expected identifier, keyword, or string');
        expectActionError('{1234:0}', 'expected identifier, keyword, or string');
        expectActionError('{#myField:0}', 'expected identifier, keyword or string');
      });

      it('should parse property shorthand declarations', () => {
        checkAction('{a, b, c}', '{a: a, b: b, c: c}');
        checkAction('{a: 1, b}', '{a: 1, b: b}');
        checkAction('{a, b: 1}', '{a: a, b: 1}');
        checkAction('{a: 1, b, c: 2}', '{a: 1, b: b, c: 2}');
      });

      it('should not allow property shorthand declaration on quoted properties', () => {
        expectActionError('{"a-b"}', 'expected : at column 7');
      });

      it('should not infer invalid identifiers as shorthand property declarations', () => {
        expectActionError('{a.b}', 'expected } at column 3');
        expectActionError('{a["b"]}', 'expected } at column 3');
        expectActionError('{1234}', ' expected identifier, keyword, or string at column 2');
      });

      it('should parse spread assignments in object literals', () => {
        checkAction('{...foo}');
        checkAction('{one: 1, ...foo, two: 2}');
        checkAction('{...foo, middle: true, ...bar}');
        checkAction('{...{...{...{foo: 1}}}}');
      });

      it('should spread elements in array literals', () => {
        checkAction('[...foo]');
        checkAction('[1, ...foo, 2]');
        checkAction('[...foo, middle, ...bar]');
        checkAction('[...[...[...[1]]]]');
        checkAction('[a, ...b, ...[1, 2, 3]]');
      });
    });

    describe('member access', () => {
      it('should parse field access', () => {
        checkAction('a');
        checkAction('this.a', 'a');
        checkAction('a.a');
      });

      it('should error for private identifiers with implicit receiver', () => {
        checkActionWithError(
          '#privateField',
          '',
          'Private identifiers are not supported. Unexpected private identifier: #privateField at column 1',
        );
      });

      it('should only allow identifier or keyword as member names', () => {
        checkActionWithError('x.', 'x.', 'identifier or keyword');
        checkActionWithError('x.(', 'x.', 'identifier or keyword');
        checkActionWithError('x. 1234', 'x.', 'identifier or keyword');
        checkActionWithError('x."foo"', 'x.', 'identifier or keyword');
        checkActionWithError(
          'x.#privateField',
          'x.',
          'Private identifiers are not supported. Unexpected private identifier: #privateField, expected identifier or keyword',
        );
      });

      it('should parse safe field access', () => {
        checkAction('a?.a');
        checkAction('a.a?.a');
      });

      it('should parse incomplete safe field accesses', () => {
        checkActionWithError('a?.a.', 'a?.a.', 'identifier or keyword');
        checkActionWithError('a.a?.a.', 'a.a?.a.', 'identifier or keyword');
        checkActionWithError('a.a?.a?. 1234', 'a.a?.a?.', 'identifier or keyword');
      });
    });

    describe('property write', () => {
      it('should parse property writes', () => {
        checkAction('a.a = 1 + 2');
        checkAction('this.a.a = 1 + 2', 'a.a = 1 + 2');
        checkAction('a.a.a = 1 + 2');
      });

      describe('malformed property writes', () => {
        it('should recover on empty rvalues', () => {
          checkActionWithError('a.a = ', 'a.a = ', 'Unexpected end of expression');
        });

        it('should recover on incomplete rvalues', () => {
          checkActionWithError('a.a = 1 + ', 'a.a = 1 + ', 'Unexpected end of expression');
        });

        it('should recover on missing properties', () => {
          checkActionWithError(
            'a. = 1',
            'a. = 1',
            'Expected identifier for property access at column 2',
          );
        });

        it('should error on writes after a property write', () => {
          const ast = parseAction('a.a = 1 = 2');
          expect(unparse(ast)).toEqual('a.a = 1');
          validate(ast);

          expect(ast.errors.length).toBe(1);
          expect(ast.errors[0].msg).toContain("Unexpected token '='");
        });
      });
    });

    describe('calls', () => {
      it('should parse calls', () => {
        checkAction('fn()');
        checkAction('add(1, 2)');
        checkAction('a.add(1, 2)');
        checkAction('fn().add(1, 2)');
        checkAction('fn()(1, 2)');
      });

      it('should parse an EmptyExpr with a correct span for a trailing empty argument', () => {
        const ast = parseAction('fn(1, )').ast as Call;
        expect(ast.args[1]).toBeInstanceOf(EmptyExpr);
        const sourceSpan = (ast.args[1] as EmptyExpr).sourceSpan;
        expect([sourceSpan.start, sourceSpan.end]).toEqual([5, 6]);
      });

      it('should parse safe calls', () => {
        checkAction('fn?.()');
        checkAction('add?.(1, 2)');
        checkAction('a.add?.(1, 2)');
        checkAction('a?.add?.(1, 2)');
        checkAction('fn?.().add?.(1, 2)');
        checkAction('fn?.()?.(1, 2)');
      });

      it('should parse rest arguments in calls', () => {
        checkAction('fn(...foo)');
        checkAction('fn(1, ...foo, 2)');
        checkAction('fn(...foo, middle, ...bar)');
        checkAction('fn(a, ...b, ...[1, 2, 3])');
      });

      it('should parse rest arguments in safe calls', () => {
        checkAction('fn?.(...foo)');
        checkAction('fn?.(1, ...foo, 2)');
        checkAction('fn?.(...foo, middle, ...bar)');
        checkAction('fn?.(a, ...b, ...[1, 2, 3])');
      });
    });

    describe('keyed read', () => {
      it('should parse keyed reads', () => {
        checkBinding('a["a"]');
        checkBinding('this.a["a"]', 'a["a"]');
        checkBinding('a.a["a"]');
      });

      it('should parse safe keyed reads', () => {
        checkBinding('a?.["a"]');
        checkBinding('this.a?.["a"]', 'a?.["a"]');
        checkBinding('a.a?.["a"]');
        checkBinding('a.a?.["a" | foo]', 'a.a?.[("a" | foo)]');
      });

      describe('malformed keyed reads', () => {
        it('should recover on missing keys', () => {
          checkActionWithError('a[]', 'a[]', 'Key access cannot be empty');
        });

        it('should recover on incomplete expression keys', () => {
          checkActionWithError('a[1 + ]', 'a[1 + ]', 'Unexpected token ]');
        });

        it('should recover on unterminated keys', () => {
          checkActionWithError(
            'a[1 + 2',
            'a[1 + 2]',
            'Missing expected ] at the end of the expression',
          );
        });

        it('should recover on incomplete and unterminated keys', () => {
          checkActionWithError(
            'a[1 + ',
            'a[1 + ]',
            'Missing expected ] at the end of the expression',
          );
        });
      });
    });

    describe('keyed write', () => {
      it('should parse keyed writes', () => {
        checkAction('a["a"] = 1 + 2');
        checkAction('this.a["a"] = 1 + 2', 'a["a"] = 1 + 2');
        checkAction('a.a["a"] = 1 + 2');
      });

      it('should report on safe keyed writes', () => {
        expectActionError('a?.["a"] = 123', 'cannot be used in the assignment');
      });

      describe('malformed keyed writes', () => {
        it('should recover on empty rvalues', () => {
          checkActionWithError('a["a"] = ', 'a["a"] = ', 'Unexpected end of expression');
        });

        it('should recover on incomplete rvalues', () => {
          checkActionWithError('a["a"] = 1 + ', 'a["a"] = 1 + ', 'Unexpected end of expression');
        });

        it('should recover on missing keys', () => {
          checkActionWithError('a[] = 1', 'a[] = 1', 'Key access cannot be empty');
        });

        it('should recover on incomplete expression keys', () => {
          checkActionWithError('a[1 + ] = 1', 'a[1 + ] = 1', 'Unexpected token ]');
        });

        it('should recover on unterminated keys', () => {
          checkActionWithError('a[1 + 2 = 1', 'a[1 + 2] = 1', 'Missing expected ]');
        });

        it('should recover on incomplete and unterminated keys', () => {
          const ast = parseAction('a[1 + = 1');
          expect(unparse(ast)).toEqual('a[1 + ] = 1');
          validate(ast);

          const errors = ast.errors.map((e) => e.msg);
          expect(errors.length).toBe(2);
          expect(errors[0]).toContain('Unexpected token =');
          expect(errors[1]).toContain('Missing expected ]');
        });

        it('should error on writes after a keyed write', () => {
          const ast = parseAction('a[1] = 1 = 2');
          expect(unparse(ast)).toEqual('a[1] = 1');
          validate(ast);

          expect(ast.errors.length).toBe(1);
          expect(ast.errors[0].msg).toContain("Unexpected token '='");
        });

        it('should recover on parenthesized empty rvalues', () => {
          const ast = parseAction('(a[1] = b) = c = d');
          expect(unparse(ast)).toEqual('(a[1] = b)');
          validate(ast);

          expect(ast.errors.length).toBe(1);
          expect(ast.errors[0].msg).toContain("Unexpected token '='");
        });
      });
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

      it('should report on safe field assignments', () => {
        expectActionError('a?.a = 123', 'cannot be used in the assignment');
      });

      it('should support array updates', () => {
        checkAction('a[0] = 200');
      });
    });

    it('should error when using pipes', () => {
      expectActionError('x|blah', 'Cannot have a pipe');
    });

    it('should report when encountering interpolation', () => {
      expectActionError('{{a()}}', 'Got interpolation ({{}}) where expression was expected');
    });

    it('should not report interpolation inside a string', () => {
      expect(parseAction(`"{{a()}}"`).errors).toEqual([]);
      expect(parseAction(`'{{a()}}'`).errors).toEqual([]);
      expect(parseAction(`"{{a('\\"')}}"`).errors).toEqual([]);
      expect(parseAction(`'{{a("\\'")}}'`).errors).toEqual([]);
    });

    describe('template literals', () => {
      it('should parse template literals without interpolations', () => {
        checkBinding('`hello world`');
        checkBinding('`foo $`');
        checkBinding('`foo }`');
        checkBinding('`foo $ {}`');
      });

      it('should parse template literals with interpolations', () => {
        checkBinding('`hello ${name}`');
        checkBinding('`${name} Johnson`');
        checkBinding('`foo${bar}baz`');
        checkBinding('`${a} - ${b} - ${c}`');
        checkBinding('`foo ${{$: true}} baz`');
        checkBinding('`foo ${`hello ${`${a} - b`}`} baz`');
        checkBinding('[`hello ${name}`, `see ${name} later`]');
        checkBinding('`hello ${name}` + 123');
      });

      it('should parse template literals with pipes inside interpolations', () => {
        checkBinding('`hello ${name | capitalize}!!!`', '`hello ${(name | capitalize)}!!!`');
        checkBinding('`hello ${(name | capitalize)}!!!`', '`hello ${((name | capitalize))}!!!`');
      });

      it('should parse template literals in objects literals', () => {
        checkBinding('{"a": `${name}`}');
        checkBinding('{"a": `hello ${name}!`}');
        checkBinding('{"a": `hello ${`hello ${`hello`}`}!`}');
        checkBinding('{"a": `hello ${{"b": `hello`}}`}');
      });

      it('should report error if interpolation is empty', () => {
        expectBindingError('`hello ${}`', 'Template literal interpolation cannot be empty');
      });

      it('should parse tagged template literals with no interpolations', () => {
        checkBinding('tag`hello!`');
        checkBinding('tags.first`hello!`');
        checkBinding('tags[0]`hello!`');
        checkBinding('tag()`hello!`');
        checkBinding('(tag ?? otherTag)`hello!`');
        checkBinding('tag!`hello!`');
      });

      it('should parse tagged template literals with interpolations', () => {
        checkBinding('tag`hello ${name}!`');
        checkBinding('tags.first`hello ${name}!`');
        checkBinding('tags[0]`hello ${name}!`');
        checkBinding('tag()`hello ${name}!`');
        checkBinding('(tag ?? otherTag)`hello ${name}!`');
        checkBinding('tag!`hello ${name}!`');
      });

      it('should not mistake operator for tagged literal tag', () => {
        checkBinding('typeof `hello!`');
        checkBinding('typeof `hello ${name}!`');
      });
    });

    describe('regular expression literals', () => {
      it('should parse a regular expression literal without flags', () => {
        checkBinding('/abc/');
        checkBinding('/[a/]$/');
        checkBinding('/a\\w+/');
        checkBinding('/^http:\\/\\/foo\\.bar/');
      });

      it('should parse a regular expression literal with flags', () => {
        checkBinding('/abc/g');
        checkBinding('/[a/]$/gi');
        checkBinding('/a\\w+/gim');
        checkBinding('/^http:\\/\\/foo\\.bar/i');
      });

      it('should parse a regular expression that is a part of other expressions', () => {
        checkBinding('/abc/.test("foo")');
        checkBinding('"foo".match(/(abc)/)[1].toUpperCase()');
        checkBinding('/abc/.test("foo") && something || somethingElse');
      });

      it('should report invalid regular expression flag', () => {
        expectBindingError('"foo".match(/abc/O)', 'Unsupported regular expression flag "O"');
      });

      it('should report duplicated regular expression flags', () => {
        expectBindingError('"foo".match(/abc/gig)', 'Duplicate regular expression flag "g"');
      });
    });
  });

  describe('parse spans', () => {
    it('should record property read span', () => {
      const ast = parseAction('foo');
      expect(unparseWithSpan(ast)).toContain(['foo', 'foo']);
      expect(unparseWithSpan(ast)).toContain(['foo', '[nameSpan] foo']);
    });

    it('should record accessed property read span', () => {
      const ast = parseAction('foo.bar');
      expect(unparseWithSpan(ast)).toContain(['foo.bar', 'foo.bar']);
      expect(unparseWithSpan(ast)).toContain(['foo.bar', '[nameSpan] bar']);
    });

    it('should record safe property read span', () => {
      const ast = parseAction('foo?.bar');
      expect(unparseWithSpan(ast)).toContain(['foo?.bar', 'foo?.bar']);
      expect(unparseWithSpan(ast)).toContain(['foo?.bar', '[nameSpan] bar']);
    });

    it('should record call span', () => {
      const ast = parseAction('foo()');
      expect(unparseWithSpan(ast)).toContain(['foo()', 'foo()']);
      expect(unparseWithSpan(ast)).toContain(['foo()', '[argumentSpan] ']);
      expect(unparseWithSpan(ast)).toContain(['foo', '[nameSpan] foo']);
    });

    it('should record call argument span', () => {
      const ast = parseAction('foo(1 + 2)');
      expect(unparseWithSpan(ast)).toContain(['foo(1 + 2)', '[argumentSpan] 1 + 2']);
    });

    it('should record accessed call span', () => {
      const ast = parseAction('foo.bar()');
      expect(unparseWithSpan(ast)).toContain(['foo.bar()', 'foo.bar()']);
      expect(unparseWithSpan(ast)).toContain(['foo.bar', '[nameSpan] bar']);
    });

    it('should record property write span', () => {
      const ast = parseAction('a = b');
      expect(unparseWithSpan(ast)).toContain(['a = b', 'a = b']);
      expect(unparseWithSpan(ast)).toContain(['a', '[nameSpan] a']);
    });

    it('should record accessed property write span', () => {
      const ast = parseAction('a.b = c');
      expect(unparseWithSpan(ast)).toContain(['a.b = c', 'a.b = c']);
      expect(unparseWithSpan(ast)).toContain(['a.b', '[nameSpan] b']);
    });

    it('should record spans for untagged template literals with no interpolations', () => {
      const ast = parseAction('`hello world`');
      const unparsed = unparseWithSpan(ast);
      expect(unparsed).toEqual([
        ['`hello world`', '`hello world`'],
        ['hello world', '`hello world`'],
      ]);
    });

    it('should record spans for untagged template literals with interpolations', () => {
      const ast = parseAction('`before ${one} - ${two} - ${three} after`');
      const unparsed = unparseWithSpan(ast);
      expect(unparsed).toEqual([
        ['`before ${one} - ${two} - ${three} after`', '`before ${one} - ${two} - ${three} after`'],
        ['before ', '`before '],
        ['one', 'one'],
        ['one', '[nameSpan] one'],
        ['', ''], // Implicit receiver
        [' - ', ' - '],
        ['two', 'two'],
        ['two', '[nameSpan] two'],
        ['', ''], // Implicit receiver
        [' - ', ' - '],
        ['three', 'three'],
        ['three', '[nameSpan] three'],
        ['', ''], // Implicit receiver
        [' after', ' after`'],
      ]);
    });

    it('should record spans for tagged template literal with no interpolations', () => {
      const ast = parseAction('tag`text`');
      const unparsed = unparseWithSpan(ast);
      expect(unparsed).toEqual([
        ['tag`text`', 'tag`text`'],
        ['tag', 'tag'],
        ['tag', '[nameSpan] tag'],
        ['', ''], // Implicit receiver
        ['`text`', '`text`'],
        ['text', '`text`'],
      ]);
    });

    it('should record spans for tagged template literal with interpolations', () => {
      const ast = parseAction('tag`before ${one} - ${two} - ${three} after`');
      const unparsed = unparseWithSpan(ast);
      expect(unparsed).toEqual([
        [
          'tag`before ${one} - ${two} - ${three} after`',
          'tag`before ${one} - ${two} - ${three} after`',
        ],
        ['tag', 'tag'],
        ['tag', '[nameSpan] tag'],
        ['', ''], // Implicit receiver
        ['`before ${one} - ${two} - ${three} after`', '`before ${one} - ${two} - ${three} after`'],
        ['before ', '`before '],
        ['one', 'one'],
        ['one', '[nameSpan] one'],
        ['', ''], // Implicit receiver
        [' - ', ' - '],
        ['two', 'two'],
        ['two', '[nameSpan] two'],
        ['', ''], // Implicit receiver
        [' - ', ' - '],
        ['three', 'three'],
        ['three', '[nameSpan] three'],
        ['', ''], // Implicit receiver
        [' after', ' after`'],
      ]);
    });

    it('should record spans for binary assignment operations', () => {
      expect(unparseWithSpan(parseAction('a.b ??= c'))).toEqual([
        ['a.b ??= c', 'a.b ??= c'],
        ['a.b', 'a.b'],
        ['a.b', '[nameSpan] b'],
        ['a', 'a'],
        ['a', '[nameSpan] a'],
        ['', ''],
        ['c', 'c'],
        ['c', '[nameSpan] c'],
        ['', ' '],
      ]);
      expect(unparseWithSpan(parseAction('a[b] ||= c'))).toEqual([
        ['a[b] ||= c', 'a[b] ||= c'],
        ['a[b]', 'a[b]'],
        ['a', 'a'],
        ['a', '[nameSpan] a'],
        ['', ''],
        ['b', 'b'],
        ['b', '[nameSpan] b'],
        ['', ''],
        ['c', 'c'],
        ['c', '[nameSpan] c'],
        ['', ' '],
      ]);
    });

    it('should include parenthesis in spans', () => {
      // When a LHS expression is parenthesized, the parenthesis on the left used to be
      // excluded from the span. This test verifies that the parenthesis are properly included
      // in the span for both LHS and RHS expressions.
      // https://github.com/angular/angular/issues/40721
      expectSpan('(foo) && (bar)');
      expectSpan('(foo) || (bar)');
      expectSpan('(foo) == (bar)');
      expectSpan('(foo) === (bar)');
      expectSpan('(foo) != (bar)');
      expectSpan('(foo) !== (bar)');
      expectSpan('(foo) > (bar)');
      expectSpan('(foo) >= (bar)');
      expectSpan('(foo) < (bar)');
      expectSpan('(foo) <= (bar)');
      expectSpan('(foo) + (bar)');
      expectSpan('(foo) - (bar)');
      expectSpan('(foo) * (bar)');
      expectSpan('(foo) / (bar)');
      expectSpan('(foo) % (bar)');
      expectSpan('(foo) | pipe');
      expectSpan('(foo)()');
      expectSpan('(foo).bar');
      expectSpan('(foo)?.bar');
      expectSpan('(foo).bar = (baz)');
      expectSpan('(foo | pipe) == false');
      expectSpan('(((foo) && bar) || baz) === true');

      function expectSpan(input: string) {
        expect(unparseWithSpan(parseBinding(input))).toContain([jasmine.any(String), input]);
      }
    });

    it('should produce correct span for typeof expression', () => {
      const ast = parseAction('foo = typeof bar');

      expect(unparseWithSpan(ast)).toEqual([
        ['foo = typeof bar', 'foo = typeof bar'],
        ['foo', 'foo'],
        ['foo', '[nameSpan] foo'],
        ['', ''],
        ['typeof bar', 'typeof bar'],
        ['bar', 'bar'],
        ['bar', '[nameSpan] bar'],
        ['', ' '],
      ]);
    });

    it('should produce correct span for void expression', () => {
      const ast = parseAction('foo = void bar');

      expect(unparseWithSpan(ast)).toEqual([
        ['foo = void bar', 'foo = void bar'],
        ['foo', 'foo'],
        ['foo', '[nameSpan] foo'],
        ['', ''],
        ['void bar', 'void bar'],
        ['bar', 'bar'],
        ['bar', '[nameSpan] bar'],
        ['', ' '],
      ]);
    });

    it('should record span for a regex without flags', () => {
      const ast = parseBinding('/^http:\\/\\/foo\\.bar/');
      expect(unparseWithSpan(ast)).toContain([
        '/^http:\\/\\/foo\\.bar/',
        '/^http:\\/\\/foo\\.bar/',
      ]);
    });

    it('should record span for a regex with flags', () => {
      const ast = parseBinding('/^http:\\/\\/foo\\.bar/gim');
      expect(unparseWithSpan(ast)).toContain([
        '/^http:\\/\\/foo\\.bar/gim',
        '/^http:\\/\\/foo\\.bar/gim',
      ]);
    });

    it('should record span for literal map keys', () => {
      const ast = parseBinding('{one: 1, two: "the number two", three, "four": 4, ...five}');
      const literal = ast.ast as LiteralMap;
      const getSource = (span: ParseSpan) => ast.source?.substring(span.start, span.end);

      expect(getSource(literal.keys[0].span)).toBe('one');
      expect(getSource(literal.keys[1].span)).toBe('two');
      expect(getSource(literal.keys[2].span)).toBe('three');
      expect(getSource(literal.keys[3].span)).toBe('"four"');
      expect(getSource(literal.keys[4].span)).toBe('...');
    });

    it('should record span for spread elements', () => {
      expect(unparseWithSpan(parseBinding('[...foo]'))).toEqual([
        ['[...foo]', '[...foo]'],
        ['...foo', '...foo'],
        ['foo', 'foo'],
        ['foo', '[nameSpan] foo'],
        ['', ''],
      ]);
    });

    it('should record span for rest arguments in functions', () => {
      expect(unparseWithSpan(parseBinding('fn(1, ...foo)'))).toEqual([
        ['fn(1, ...foo)', 'fn(1, ...foo)'],
        ['fn(1, ...foo)', '[argumentSpan] 1, ...foo'],
        ['fn', 'fn'],
        ['fn', '[nameSpan] fn'],
        ['', ''],
        ['1', '1'],
        ['...foo', '...foo'],
        ['foo', 'foo'],
        ['foo', '[nameSpan] foo'],
        ['', ''],
      ]);
    });
  });

  describe('general error handling', () => {
    it('should report an unexpected token', () => {
      expectActionError('[1,2] trac', "Unexpected token 'trac'");
    });

    it('should report reasonable error for unconsumed tokens', () => {
      expectActionError(')', 'Unexpected token ) at column 1 in [)]');
    });

    it('should report a missing expected token', () => {
      expectActionError('a(b', 'Missing expected ) at the end of the expression [a(b]');
    });

    it('should report a single error for an `as` expression inside a parenthesized expression', () => {
      expectActionError(
        `foo(($event.target as HTMLElement).value)`,
        'Missing closing parentheses at column 20',
        1,
      );
      expectActionError(
        `foo(((($event.target as HTMLElement))).value)`,
        'Missing closing parentheses at column 22',
        1,
      );
    });
  });

  describe('parseBinding', () => {
    describe('pipes', () => {
      it('should parse pipes', () => {
        checkBinding('a(b | c)', 'a((b | c))');
        checkBinding('a.b(c.d(e) | f)', 'a.b((c.d(e) | f))');
        checkBinding('[1, 2, 3] | a', '([1, 2, 3] | a)');
        checkBinding('{a: 1, "b": 2} | c', '({a: 1, "b": 2} | c)');
        checkBinding('a[b] | c', '(a[b] | c)');
        checkBinding('a?.b | c', '(a?.b | c)');
        checkBinding('true | a', '(true | a)');
        checkBinding('a | b:c | d', '((a | b:c) | d)');
        checkBinding('a | b:(c | d)', '(a | b:((c | d)))');
      });

      describe('should parse incomplete pipes', () => {
        const cases: Array<[string, string, string, string]> = [
          [
            'should parse missing pipe names: end',
            'a | b | ',
            '((a | b) | )',
            'Unexpected end of input, expected identifier or keyword',
          ],
          [
            'should parse missing pipe names: middle',
            'a | | b',
            '((a | ) | b)',
            'Unexpected token |, expected identifier or keyword',
          ],
          [
            'should parse missing pipe names: start',
            ' | a | b',
            '(( | a) | b)',
            'Unexpected token |',
          ],
          [
            'should parse missing pipe args: end',
            'a | b | c: ',
            '((a | b) | c:)',
            'Unexpected end of expression',
          ],
          [
            'should parse missing pipe args: middle',
            'a | b: | c',
            '((a | b:) | c)',
            'Unexpected token |',
          ],
          [
            'should parse incomplete pipe args',
            'a | b: (a | ) + | c',
            '((a | b:((a | )) + ) | c)',
            'Unexpected token |',
          ],
        ];

        for (const [name, input, output, err] of cases) {
          it(name, () => {
            checkBinding(input, output);
            expectBindingError(input, err);
          });
        }

        it('should parse an incomplete pipe with a source span that includes trailing whitespace', () => {
          const bindingText = 'foo | ';
          const binding = parseBinding(bindingText).ast as BindingPipe;

          // The sourceSpan should include all characters of the input.
          expect(rawSpan(binding.sourceSpan)).toEqual([0, bindingText.length]);
          // The nameSpan should be positioned at the end of the input.
          expect(rawSpan(binding.nameSpan)).toEqual([bindingText.length, bindingText.length]);
        });

        it('should parse pipes with the correct type when supportsDirectPipeReferences is enabled', () => {
          expect((parseBinding('0 | Foo', true).ast as BindingPipe).type).toBe(
            BindingPipeType.ReferencedDirectly,
          );
          expect((parseBinding('0 | foo', true).ast as BindingPipe).type).toBe(
            BindingPipeType.ReferencedByName,
          );
        });

        it('should parse pipes with the correct type when supportsDirectPipeReferences is disabled', () => {
          expect((parseBinding('0 | Foo', false).ast as BindingPipe).type).toBe(
            BindingPipeType.ReferencedByName,
          );
          expect((parseBinding('0 | foo', false).ast as BindingPipe).type).toBe(
            BindingPipeType.ReferencedByName,
          );
        });
      });

      it('should only allow identifier or keyword as formatter names', () => {
        expectBindingError('"Foo"|(', 'identifier or keyword');
        expectBindingError('"Foo"|1234', 'identifier or keyword');
        expectBindingError('"Foo"|"uppercase"', 'identifier or keyword');
        expectBindingError('"Foo"|#privateIdentifier"', 'identifier or keyword');
      });

      it('should not crash when prefix part is not tokenizable', () => {
        checkBinding('"a:b"', '"a:b"');
      });
    });

    it('should store the source in the result', () => {
      expect(parseBinding('someExpr').source).toBe('someExpr');
    });

    it('should report chain expressions', () => {
      expectError(parseBinding('1;2'), 'contain chained expression');
    });

    it('should report assignment', () => {
      expectError(parseBinding('a=2'), 'contain assignments');
    });

    it('should report when encountering interpolation', () => {
      expectBindingError('{{a.b}}', 'Got interpolation ({{}}) where expression was expected');
    });

    it('should not report interpolation inside a string', () => {
      expect(parseBinding(`"{{exp}}"`).errors).toEqual([]);
      expect(parseBinding(`'{{exp}}'`).errors).toEqual([]);
      expect(parseBinding(`'{{\\"}}'`).errors).toEqual([]);
      expect(parseBinding(`'{{\\'}}'`).errors).toEqual([]);
    });

    it('should parse conditional expression', () => {
      checkBinding('a < b ? a : b');
    });

    it('should ignore comments in bindings', () => {
      checkBinding('a //comment', 'a');
    });

    it('should retain // in string literals', () => {
      checkBinding(`"http://www.google.com"`, `"http://www.google.com"`);
    });

    it('should expose object shorthand information in AST', () => {
      const parser = new Parser(new Lexer());
      const ast = parser.parseBinding('{bla}', getFakeSpan(), 0);
      const map = ast.ast as LiteralMap;
      expect(map instanceof LiteralMap).toBe(true);
      expect(map.keys.length).toBe(1);
      expect((map.keys[0] as LiteralMapPropertyKey).isShorthandInitialized).toBe(true);
    });

    describe('arrow functions', () => {
      it('should parse a single-parameter arrow function', () => {
        checkBinding('a => a');
      });

      it('should parse a single-parameter arrow function with parentheses', () => {
        checkBinding('(a) => a', 'a => a');
      });

      it('should parse an arrow function with not parameters', () => {
        checkBinding('() => 1');
      });

      it('should parse an arrow function with multiple parameters', () => {
        checkBinding('(a, b, c, d, e) => a / b + c * d');
      });

      it('should parse an immediately-invoked arrow function', () => {
        checkBinding('((a, b) => a + b)(1, 2)');
      });

      it('should parse an arrow function that returns other arrow functions', () => {
        checkBinding('(a, b) => c => (d, e) => () => a + b + c + d + e');
      });

      it('should parse an arrow function that returns an object literal', () => {
        checkBinding('() => ({a: 1, b: 2})');
      });

      it('should parse an arrow function containing an assignment', () => {
        checkBinding('(a, b) => c = a + b');
      });

      it('should be able to pass an arrow function through a pipe', () => {
        checkBinding('(a, b) => a + b | pipe', '((a, b) => a + b | pipe)');
      });

      it('should parse an arrow function that returns an array', () => {
        checkBinding('(a, b) => [a, b, foo]');
      });

      describe('arrow function spans', () => {
        it('should produce spans for the entire arrow function', () => {
          expect(unparseWithSpan(parseBinding('a => a'))).toEqual([
            ['a => a', 'a => a'],
            ['a', 'a'],
            ['a', '[nameSpan] a'],
            ['', ' '],
          ]);
          expect(unparseWithSpan(parseBinding('(a, b, c) => a + b + c'))).toEqual([
            ['(a, b, c) => a + b + c', '(a, b, c) => a + b + c'],
            ['a + b + c', 'a + b + c'],
            ['a + b', 'a + b'],
            ['a', 'a'],
            ['a', '[nameSpan] a'],
            ['', ' '],
            ['b', 'b'],
            ['b', '[nameSpan] b'],
            ['', ' '],
            ['c', 'c'],
            ['c', '[nameSpan] c'],
            ['', ' '],
          ]);
        });

        it('should produce spans for the arrow function parameters', () => {
          const ast = parseBinding('(foo, bar, baz) => foo + bar + baz');
          const arrowFn = ast.ast as ArrowFunction;
          const getSource = (span: ParseSpan) => ast.source?.substring(span.start, span.end);

          expect(getSource(arrowFn.parameters[0].span)).toBe('foo');
          expect(getSource(arrowFn.parameters[1].span)).toBe('bar');
          expect(getSource(arrowFn.parameters[2].span)).toBe('baz');
        });
      });

      describe('arrow function validations', () => {
        it('should not allow pipe to be used inside an arrow function', () => {
          expectBindingError(
            '(a, b) => (a + b | pipe)',
            'Cannot have a pipe in an action expression',
          );
        });

        it('should report an error for an arrow function with a body', () => {
          expectBindingError('() => {}', 'Multi-line arrow functions are not supported');
        });

        it('should report missing comma between arrow function parameters', () => {
          expectBindingError('(a b) => a + b', 'Missing expected ,');
        });

        it('should report arrow function parameter starting with a comma', () => {
          expectBindingError('(, a) => a', 'Unexpected token ,');
        });

        it('should report arrow function parameter with a trailing comma', () => {
          expectBindingError('(a, ) => a', 'Unexpected token )');
        });

        it('should report an arrow function without a closing paren', () => {
          expectBindingError(
            '(a => a + 1',
            'Missing closing parentheses at the end of the expression',
          );
        });

        it('should report an arrow function without an opening paren', () => {
          expectBindingError('a) => a + 1', "Unexpected token ')'");
        });

        it('should report an error inside the arrow function expression', () => {
          expectBindingError('(a) => a. + 1', 'Unexpected token +, expected identifier or keyword');
        });

        it('should report an error for chained expression in arrow function', () => {
          expectBindingError(
            '() => foo(); bar()',
            'Binding expression cannot contain chained expression',
          );
          expectBindingError(
            '() => (foo; bar)',
            'Binding expression cannot contain chained expression',
          );
        });
      });
    });
  });

  describe('parseTemplateBindings', () => {
    function humanize(bindings: TemplateBinding[]): Array<[string, string | null, boolean]> {
      return bindings.map((binding) => {
        const key = binding.key.source;
        const value = binding.value ? binding.value.source : null;
        const keyIsVar = binding instanceof VariableBinding;
        return [key, value, keyIsVar];
      });
    }

    function humanizeSpans(
      bindings: TemplateBinding[],
      attr: string,
    ): Array<[string, string, string | null]> {
      return bindings.map((binding) => {
        const {sourceSpan, key, value} = binding;
        const sourceStr = attr.substring(sourceSpan.start, sourceSpan.end);
        const keyStr = attr.substring(key.span.start, key.span.end);
        let valueStr = null;
        if (value) {
          const {start, end} = value instanceof ASTWithSource ? value.ast.sourceSpan : value.span;
          valueStr = attr.substring(start, end);
        }
        return [sourceStr, keyStr, valueStr];
      });
    }

    it('should parse key and value', () => {
      const cases: Array<[string, string, string | null, boolean, string, string, string | null]> =
        [
          // expression, key, value, VariableBinding, source span, key span, value span
          ['*a=""', 'a', null, false, 'a="', 'a', null],
          ['*a="b"', 'a', 'b', false, 'a="b', 'a', 'b'],
          ['*a-b="c"', 'a-b', 'c', false, 'a-b="c', 'a-b', 'c'],
          ['*a="1+1"', 'a', '1+1', false, 'a="1+1', 'a', '1+1'],
        ];
      for (const [attr, key, value, keyIsVar, sourceSpan, keySpan, valueSpan] of cases) {
        const bindings = parseTemplateBindings(attr);
        expect(humanize(bindings)).toEqual([[key, value, keyIsVar]]);
        expect(humanizeSpans(bindings, attr)).toEqual([[sourceSpan, keySpan, valueSpan]]);
      }
    });

    it('should variable declared via let', () => {
      const bindings = parseTemplateBindings('*a="let b"');
      expect(humanize(bindings)).toEqual([
        // key, value, VariableBinding
        ['a', null, false],
        ['b', null, true],
      ]);
    });

    it('should allow multiple pairs', () => {
      const bindings = parseTemplateBindings('*a="1 b 2"');
      expect(humanize(bindings)).toEqual([
        // key, value, VariableBinding
        ['a', '1', false],
        ['aB', '2', false],
      ]);
    });

    it('should allow space and colon as separators', () => {
      const bindings = parseTemplateBindings('*a="1,b 2"');
      expect(humanize(bindings)).toEqual([
        // key, value, VariableBinding
        ['a', '1', false],
        ['aB', '2', false],
      ]);
    });

    it('should store the templateUrl', () => {
      const bindings = parseTemplateBindings('*a="1,b 2"', '/foo/bar.html');
      expect(humanize(bindings)).toEqual([
        // key, value, VariableBinding
        ['a', '1', false],
        ['aB', '2', false],
      ]);
      expect((bindings[0].value as ASTWithSource).location).toEqual('/foo/bar.html@0:0');
    });

    it('should support common usage of ngIf', () => {
      const bindings = parseTemplateBindings('*ngIf="cond | pipe as foo, let x; ngIf as y"');
      expect(humanize(bindings)).toEqual([
        // [ key, value, VariableBinding ]
        ['ngIf', 'cond | pipe', false],
        ['foo', 'ngIf', true],
        ['x', null, true],
        ['y', 'ngIf', true],
      ]);
    });

    it('should support common usage of ngFor', () => {
      let bindings: TemplateBinding[];
      bindings = parseTemplateBindings('*ngFor="let person of people"');
      expect(humanize(bindings)).toEqual([
        // [ key, value, VariableBinding ]
        ['ngFor', null, false],
        ['person', null, true],
        ['ngForOf', 'people', false],
      ]);

      bindings = parseTemplateBindings(
        '*ngFor="let item; of items | slice:0:1 as collection, trackBy: func; index as i"',
      );
      expect(humanize(bindings)).toEqual([
        // [ key, value, VariableBinding ]
        ['ngFor', null, false],
        ['item', null, true],
        ['ngForOf', 'items | slice:0:1', false],
        ['collection', 'ngForOf', true],
        ['ngForTrackBy', 'func', false],
        ['i', 'index', true],
      ]);

      bindings = parseTemplateBindings(
        '*ngFor="let item, of: [1,2,3] | pipe as items; let i=index, count as len"',
      );
      expect(humanize(bindings)).toEqual([
        // [ key, value, VariableBinding ]
        ['ngFor', null, false],
        ['item', null, true],
        ['ngForOf', '[1,2,3] | pipe', false],
        ['items', 'ngForOf', true],
        ['i', 'index', true],
        ['len', 'count', true],
      ]);
    });

    it('should parse pipes', () => {
      const bindings = parseTemplateBindings('*key="value|pipe "');
      expect(humanize(bindings)).toEqual([
        // [ key, value, VariableBinding ]
        ['key', 'value|pipe', false],
      ]);
      const {value} = bindings[0];
      expect(value).toBeInstanceOf(ASTWithSource);
      expect((value as ASTWithSource).ast).toBeInstanceOf(BindingPipe);
    });

    describe('"let" binding', () => {
      it('should support single declaration', () => {
        const bindings = parseTemplateBindings('*key="let i"');
        expect(humanize(bindings)).toEqual([
          // [ key, value, VariableBinding ]
          ['key', null, false],
          ['i', null, true],
        ]);
      });

      it('should support multiple declarations', () => {
        const bindings = parseTemplateBindings('*key="let a; let b"');
        expect(humanize(bindings)).toEqual([
          // [ key, value, VariableBinding ]
          ['key', null, false],
          ['a', null, true],
          ['b', null, true],
        ]);
      });

      it('should support empty string assignment', () => {
        const bindings = parseTemplateBindings(`*key="let a=''; let b='';"`);
        expect(humanize(bindings)).toEqual([
          // [ key, value, VariableBinding ]
          ['key', null, false],
          ['a', '', true],
          ['b', '', true],
        ]);
      });

      it('should support key and value names with dash', () => {
        const bindings = parseTemplateBindings('*key="let i-a = j-a,"');
        expect(humanize(bindings)).toEqual([
          // [ key, value, VariableBinding ]
          ['key', null, false],
          ['i-a', 'j-a', true],
        ]);
      });

      it('should support declarations with or without value assignment', () => {
        const bindings = parseTemplateBindings('*key="let item; let i = k"');
        expect(humanize(bindings)).toEqual([
          // [ key, value, VariableBinding ]
          ['key', null, false],
          ['item', null, true],
          ['i', 'k', true],
        ]);
      });

      it('should support declaration before an expression', () => {
        const bindings = parseTemplateBindings('*directive="let item in expr; let a = b"');
        expect(humanize(bindings)).toEqual([
          // [ key, value, VariableBinding ]
          ['directive', null, false],
          ['item', null, true],
          ['directiveIn', 'expr', false],
          ['a', 'b', true],
        ]);
      });
    });

    describe('"as" binding', () => {
      it('should support single declaration', () => {
        const bindings = parseTemplateBindings('*ngIf="exp as local"');
        expect(humanize(bindings)).toEqual([
          // [ key, value, VariableBinding ]
          ['ngIf', 'exp', false],
          ['local', 'ngIf', true],
        ]);
      });

      it('should support declaration after an expression', () => {
        const bindings = parseTemplateBindings('*ngFor="let item of items as iter; index as i"');
        expect(humanize(bindings)).toEqual([
          // [ key, value, VariableBinding ]
          ['ngFor', null, false],
          ['item', null, true],
          ['ngForOf', 'items', false],
          ['iter', 'ngForOf', true],
          ['i', 'index', true],
        ]);
      });

      it('should support key and value names with dash', () => {
        const bindings = parseTemplateBindings('*key="foo, k-b as l-b;"');
        expect(humanize(bindings)).toEqual([
          // [ key, value, VariableBinding ]
          ['key', 'foo', false],
          ['l-b', 'k-b', true],
        ]);
      });
    });

    describe('source, key, value spans', () => {
      it('should map empty expression', () => {
        const attr = '*ngIf=""';
        const bindings = parseTemplateBindings(attr);
        expect(humanizeSpans(bindings, attr)).toEqual([
          // source span, key span, value span
          ['ngIf="', 'ngIf', null],
        ]);
      });

      it('should map variable declaration via "let"', () => {
        const attr = '*key="let i"';
        const bindings = parseTemplateBindings(attr);
        expect(humanizeSpans(bindings, attr)).toEqual([
          // source span, key span, value span
          ['key="', 'key', null], // source span stretches till next binding
          ['let i', 'i', null],
        ]);
      });

      it('shoud map multiple variable declarations via "let"', () => {
        const attr = '*key="let item; let i=index; let e=even;"';
        const bindings = parseTemplateBindings(attr);
        expect(humanizeSpans(bindings, attr)).toEqual([
          // source span, key span, value span
          ['key="', 'key', null],
          ['let item; ', 'item', null],
          ['let i=index; ', 'i', 'index'],
          ['let e=even;', 'e', 'even'],
        ]);
      });

      it('shoud map expression with pipe', () => {
        const attr = '*ngIf="cond | pipe as foo, let x; ngIf as y"';
        const bindings = parseTemplateBindings(attr);
        expect(humanizeSpans(bindings, attr)).toEqual([
          // source span, key span, value span
          ['ngIf="cond | pipe ', 'ngIf', 'cond | pipe'],
          ['ngIf="cond | pipe as foo, ', 'foo', 'ngIf'],
          ['let x; ', 'x', null],
          ['ngIf as y', 'y', 'ngIf'],
        ]);
      });

      it('should report unexpected token when encountering interpolation', () => {
        const attr = '*ngIf="name && {{name}}"';

        expectParseTemplateBindingsError(
          attr,
          'Parser Error: Unexpected token {, expected identifier, keyword, or string at column 10 in [name && {{name}}] in foo.html@0:0',
        );
      });

      it('should map variable declaration via "as"', () => {
        const attr =
          '*ngFor="let item; of items | slice:0:1 as collection, trackBy: func; index as i"';
        const bindings = parseTemplateBindings(attr);
        expect(humanizeSpans(bindings, attr)).toEqual([
          // source span, key span, value span
          ['ngFor="', 'ngFor', null],
          ['let item; ', 'item', null],
          ['of items | slice:0:1 ', 'of', 'items | slice:0:1'],
          ['of items | slice:0:1 as collection, ', 'collection', 'of'],
          ['trackBy: func; ', 'trackBy', 'func'],
          ['index as i', 'i', 'index'],
        ]);
      });

      it('should map literal array', () => {
        const attr = '*ngFor="let item, of: [1,2,3] | pipe as items; let i=index, count as len, "';
        const bindings = parseTemplateBindings(attr);
        expect(humanizeSpans(bindings, attr)).toEqual([
          // source span, key span, value span
          ['ngFor="', 'ngFor', null],
          ['let item, ', 'item', null],
          ['of: [1,2,3] | pipe ', 'of', '[1,2,3] | pipe'],
          ['of: [1,2,3] | pipe as items; ', 'items', 'of'],
          ['let i=index, ', 'i', 'index'],
          ['count as len,', 'len', 'count'],
        ]);
      });
    });
  });

  describe('parseInterpolation', () => {
    it('should return null if no interpolation', () => {
      expect(parseInterpolation('nothing')).toBe(null);
    });

    it('should not parse malformed interpolations as strings', () => {
      const ast = parseInterpolation('{{a}} {{example}<!--->}')!.ast as Interpolation;
      expect(ast.strings).toEqual(['', ' {{example}<!--->}']);
      expect(ast.expressions.length).toEqual(1);
      expect((ast.expressions[0] as PropertyRead).name).toEqual('a');
    });

    it('should parse no prefix/suffix interpolation', () => {
      const ast = parseInterpolation('{{a}}')!.ast as Interpolation;
      expect(ast.strings).toEqual(['', '']);
      expect(ast.expressions.length).toEqual(1);
      expect((ast.expressions[0] as PropertyRead).name).toEqual('a');
    });

    it('should parse interpolation inside quotes', () => {
      const ast = parseInterpolation('"{{a}}"')!.ast as Interpolation;
      expect(ast.strings).toEqual(['"', '"']);
      expect(ast.expressions.length).toEqual(1);
      expect((ast.expressions[0] as PropertyRead).name).toEqual('a');
    });

    it('should parse interpolation with interpolation characters inside quotes', () => {
      checkInterpolation('{{"{{a}}"}}', '{{ "{{a}}" }}');
      checkInterpolation('{{"{{"}}', '{{ "{{" }}');
      checkInterpolation('{{"}}"}}', '{{ "}}" }}');
      checkInterpolation('{{"{"}}', '{{ "{" }}');
      checkInterpolation('{{"}"}}', '{{ "}" }}');
    });

    it('should parse interpolation with escaped quotes', () => {
      checkInterpolation(`{{'It\\'s just Angular'}}`, `{{ "It's just Angular" }}`);
      checkInterpolation(`{{'It\\'s {{ just Angular'}}`, `{{ "It's {{ just Angular" }}`);
      checkInterpolation(`{{'It\\'s }} just Angular'}}`, `{{ "It's }} just Angular" }}`);
    });

    it('should parse interpolation with escaped backslashes', () => {
      checkInterpolation(`{{foo.split('\\\\')}}`, `{{ foo.split("\\") }}`);
      checkInterpolation(`{{foo.split('\\\\\\\\')}}`, `{{ foo.split("\\\\") }}`);
      checkInterpolation(`{{foo.split('\\\\\\\\\\\\')}}`, `{{ foo.split("\\\\\\") }}`);
    });

    it('should not parse interpolation with mismatching quotes', () => {
      expect(parseInterpolation(`{{ "{{a}}' }}`)).toBeNull();
    });

    it('should parse prefix/suffix with multiple interpolation', () => {
      const originalExp = 'before {{ a }} middle {{ b }} after';
      const ast = parseInterpolation(originalExp)!.ast;
      expect(unparse(ast)).toEqual(originalExp);
      validate(ast);
    });

    it('should report empty interpolation expressions', () => {
      expectError(
        parseInterpolation('{{}}')!,
        'Blank expressions are not allowed in interpolated strings',
      );

      expectError(
        parseInterpolation('foo {{  }}')!,
        'Parser Error: Blank expressions are not allowed in interpolated strings',
      );

      expectError(
        parseInterpolation('{{  }}')!,
        'Parser Error: Blank expressions are not allowed in interpolated strings',
      );
    });

    it('should produce an empty expression ast for empty interpolations', () => {
      const parsed = parseInterpolation('{{}}')!.ast as Interpolation;
      expect(parsed.expressions.length).toBe(1);
      expect(parsed.expressions[0]).toBeInstanceOf(EmptyExpr);
    });

    it('should parse conditional expression', () => {
      checkInterpolation('{{ a < b ? a : b }}');
    });

    it('should parse expression with newline characters', () => {
      checkInterpolation(`{{ 'foo' +\n 'bar' +\r 'baz' }}`, `{{ "foo" + "bar" + "baz" }}`);
    });

    describe('comments', () => {
      it('should ignore comments in interpolation expressions', () => {
        checkInterpolation('{{a //comment}}', '{{ a }}');
      });

      it('should error when interpolation only contains a comment', () => {
        expectError(
          parseInterpolation('{{ // foobar  }}')!,
          'Parser Error: Interpolation expression cannot only contain a comment at column 0 in [{{ // foobar  }}]',
        );
      });

      it('should retain // in single quote strings', () => {
        checkInterpolation(`{{ 'http://www.google.com' }}`, `{{ "http://www.google.com" }}`);
      });

      it('should retain // in double quote strings', () => {
        checkInterpolation(`{{ "http://www.google.com" }}`, `{{ "http://www.google.com" }}`);
      });

      it('should ignore comments after string literals', () => {
        checkInterpolation(`{{ "a//b" //comment }}`, `{{ "a//b" }}`);
      });

      it('should retain // in complex strings', () => {
        checkInterpolation(
          `{{"//a\'//b\`//c\`//d\'//e" //comment}}`,
          `{{ "//a\'//b\`//c\`//d\'//e" }}`,
        );
      });

      it('should retain // in nested, unterminated strings', () => {
        checkInterpolation(`{{ "a\'b\`" //comment}}`, `{{ "a\'b\`" }}`);
      });

      it('should ignore quotes inside a comment', () => {
        checkInterpolation(`"{{name // " }}"`, `"{{ name }}"`);
      });
    });
  });

  describe('parseSimpleBinding', () => {
    it('should parse a field access', () => {
      const p = parseSimpleBinding('name');
      expect(unparse(p)).toEqual('name');
      validate(p);
    });

    it('should report when encountering pipes', () => {
      expectError(
        validate(parseSimpleBinding('a | somePipe')),
        'Host binding expression cannot contain pipes',
      );
    });

    it('should report when encountering interpolation', () => {
      expectError(
        validate(parseSimpleBinding('{{exp}}')),
        'Got interpolation ({{}}) where expression was expected',
      );
    });

    it('should not report interpolation inside a string', () => {
      expect(parseSimpleBinding(`"{{exp}}"`).errors).toEqual([]);
      expect(parseSimpleBinding(`'{{exp}}'`).errors).toEqual([]);
      expect(parseSimpleBinding(`'{{\\"}}'`).errors).toEqual([]);
      expect(parseSimpleBinding(`'{{\\'}}'`).errors).toEqual([]);
    });

    it('should report when encountering field write', () => {
      expectError(validate(parseSimpleBinding('a = b')), 'Bindings cannot contain assignments');
    });

    it('should throw if a pipe is used inside a conditional', () => {
      expectError(
        validate(parseSimpleBinding('(hasId | myPipe) ? "my-id" : ""')),
        'Host binding expression cannot contain pipes',
      );
    });

    it('should throw if a pipe is used inside a call', () => {
      expectError(
        validate(parseSimpleBinding('getId(true, id | myPipe)')),
        'Host binding expression cannot contain pipes',
      );
    });

    it('should throw if a pipe is used inside a call to a property access', () => {
      expectError(
        validate(parseSimpleBinding('idService.getId(true, id | myPipe)')),
        'Host binding expression cannot contain pipes',
      );
    });

    it('should throw if a pipe is used inside a call to a safe property access', () => {
      expectError(
        validate(parseSimpleBinding('idService?.getId(true, id | myPipe)')),
        'Host binding expression cannot contain pipes',
      );
    });

    it('should throw if a pipe is used inside a property access', () => {
      expectError(
        validate(parseSimpleBinding('a[id | myPipe]')),
        'Host binding expression cannot contain pipes',
      );
    });

    it('should throw if a pipe is used inside a keyed read expression', () => {
      expectError(
        validate(parseSimpleBinding('a[id | myPipe].b')),
        'Host binding expression cannot contain pipes',
      );
    });

    it('should throw if a pipe is used inside a safe property read', () => {
      expectError(
        validate(parseSimpleBinding('(id | myPipe)?.id')),
        'Host binding expression cannot contain pipes',
      );
    });

    it('should throw if a pipe is used inside a non-null assertion', () => {
      expectError(
        validate(parseSimpleBinding('[id | myPipe]!')),
        'Host binding expression cannot contain pipes',
      );
    });

    it('should throw if a pipe is used inside a prefix not expression', () => {
      expectError(
        validate(parseSimpleBinding('!(id | myPipe)')),
        'Host binding expression cannot contain pipes',
      );
    });

    it('should throw if a pipe is used inside a binary expression', () => {
      expectError(
        validate(parseSimpleBinding('(id | myPipe) === true')),
        'Host binding expression cannot contain pipes',
      );
    });
  });

  describe('wrapLiteralPrimitive', () => {
    it('should wrap a literal primitive', () => {
      expect(unparse(validate(createParser().wrapLiteralPrimitive('foo', '', 0)))).toEqual('"foo"');
    });
  });

  describe('error recovery', () => {
    function recover(text: string, expected?: string) {
      const expr = validate(parseAction(text));
      expect(unparse(expr)).toEqual(expected || text);
    }
    it('should be able to recover from an extra paren', () => recover('((a)))', '((a))'));
    it('should be able to recover from an extra bracket', () => recover('[[a]]]', '[[a]]'));
    it('should be able to recover from a missing )', () => recover('(a;b', '(a); b;'));
    it('should be able to recover from a missing ]', () => recover('[a,b', '[a, b]'));
    it('should be able to recover from a missing selector', () => recover('a.'));
    it('should be able to recover from a missing selector in a array literal', () =>
      recover('[[a.], b, c]'));

    it('should recover from parenthesized `as` expressions', () => {
      recover('foo(($event.target as HTMLElement).value)', 'foo(($event.target).value)');
      recover('foo(((($event.target as HTMLElement))).value)', 'foo(((($event.target))).value)');
      recover('foo(((bar as HTMLElement) as Something).value)', 'foo(((bar)).value)');
    });

    it('should be able to recover from a broken expression in a template literal', () => {
      recover('`before ${expr.}`', '`before ${expr.}`');
      recover('`${expr.} after`', '`${expr.} after`');
      recover('`before ${expr.} after`', '`before ${expr.} after`');
    });
  });

  describe('offsets', () => {
    it('should retain the offsets of an interpolation', () => {
      const interpolations = splitInterpolation('{{a}}  {{b}}  {{c}}')!;
      expect(interpolations.offsets).toEqual([2, 9, 16]);
    });

    it('should retain the offsets into the expression AST of interpolations', () => {
      const source = parseInterpolation('{{a}}  {{b}}  {{c}}')!;
      const interpolation = source.ast as Interpolation;
      expect(interpolation.expressions.map((e) => e.span.start)).toEqual([2, 9, 16]);
    });
  });
});

function createParser(supportsDirectPipeReferences = false) {
  return new Parser(new Lexer(), supportsDirectPipeReferences);
}

function parseAction(text: string): ASTWithSource {
  return createParser().parseAction(text, getFakeSpan(), 0);
}

function parseBinding(text: string, supportsDirectPipeReferences?: boolean): ASTWithSource {
  return createParser(supportsDirectPipeReferences).parseBinding(text, getFakeSpan(), 0);
}

function parseTemplateBindings(attribute: string, templateUrl = 'foo.html'): TemplateBinding[] {
  const result = _parseTemplateBindings(attribute, templateUrl);
  expect(result.errors).toEqual([]);
  expect(result.warnings).toEqual([]);
  return result.templateBindings;
}

function expectParseTemplateBindingsError(attribute: string, error: string) {
  const result = _parseTemplateBindings(attribute, 'foo.html');
  expect(result.errors[0].msg).toEqual(error);
}

function _parseTemplateBindings(attribute: string, templateUrl: string) {
  const match = attribute.match(/^\*(.+)="(.*)"$/);
  expect(match).withContext(`failed to extract key and value from ${attribute}`).toBeTruthy();
  const [_, key, value] = match!;
  const absKeyOffset = 1; // skip the * prefix
  const absValueOffset = attribute.indexOf('=') + '="'.length;
  const parser = createParser();
  return parser.parseTemplateBindings(
    key,
    value,
    getFakeSpan(templateUrl),
    absKeyOffset,
    absValueOffset,
  );
}

function parseInterpolation(text: string): ASTWithSource | null {
  return createParser().parseInterpolation(text, getFakeSpan(), 0, null);
}

function splitInterpolation(text: string): SplitInterpolation | null {
  return createParser().splitInterpolation(text, getFakeSpan(), [], null);
}

function parseSimpleBinding(text: string): ASTWithSource {
  return createParser().parseSimpleBinding(text, getFakeSpan(), 0);
}

function checkInterpolation(exp: string, expected?: string) {
  const ast = parseInterpolation(exp);
  if (expected == null) expected = exp;
  if (ast === null) {
    throw Error(`Failed to parse expression "${exp}"`);
  }
  expect(unparse(ast)).toEqual(expected);
  validate(ast);
}

function checkBinding(exp: string, expected?: string) {
  const ast = parseBinding(exp);
  if (expected == null) expected = exp;
  expect(unparse(ast)).toEqual(expected);
  validate(ast);
}

function checkAction(exp: string, expected?: string) {
  const ast = parseAction(exp);
  if (expected == null) expected = exp;
  expect(unparse(ast)).toEqual(expected);
  validate(ast);
}

function expectError(ast: {errors: ParseError[]}, message: string, errorCount?: number) {
  if (errorCount != null) {
    expect(ast.errors.length).toBe(errorCount);
  } else {
    expect(ast.errors.length).toBeGreaterThan(0);
  }

  for (const error of ast.errors) {
    if (error.msg.indexOf(message) >= 0) {
      return;
    }
  }
  const errMsgs = ast.errors.map((err) => err.msg).join('\n');
  throw Error(
    `Expected an error containing "${message}" to be reported, but got the errors:\n` + errMsgs,
  );
}

function expectActionError(text: string, message: string, errorCount?: number) {
  expectError(validate(parseAction(text)), message, errorCount);
}

function expectBindingError(text: string, message: string) {
  expectError(validate(parseBinding(text)), message);
}

/**
 * Check that a malformed action parses to a recovered AST while emitting an error.
 */
function checkActionWithError(text: string, expected: string, error: string) {
  checkAction(text, expected);
  expectActionError(text, error);
}

function rawSpan(span: AbsoluteSourceSpan): [number, number] {
  return [span.start, span.end];
}

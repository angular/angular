import {ddescribe, describe, it, xit, iit, expect, beforeEach} from 'angular2/test_lib';

import {
  AST,
  ASTWithSource,
  AccessMember,
  Assignment,
  Binary,
  Chain,
  Conditional,
  EmptyExpr,
  If,
  Pipe,
  ImplicitReceiver,
  Interpolation,
  KeyedAccess,
  LiteralArray,
  LiteralMap,
  LiteralPrimitive,
  MethodCall,
  PrefixNot,
  SafeAccessMember,
  SafeMethodCall
} from 'angular2/src/change_detection/parser/ast';

import {Parser} from 'angular2/src/change_detection/parser/parser';
import {Lexer} from 'angular2/src/change_detection/parser/lexer';
import {Unparser} from './unparser';

import {reflector} from 'angular2/src/reflection/reflection';

import {isPresent, Type} from 'angular2/src/facade/lang';

export function main() {
  let parser: Parser = new Parser(new Lexer(), reflector);
  let unparser: Unparser = new Unparser();

  function parseAction(text, location = null): ASTWithSource {
    return parser.parseAction(text, location);
  }

  function parseBinding(text, location = null): ASTWithSource {
    return parser.parseBinding(text, location);
  }

  function check(expression: string, type: Type): void {
    var ast = parseAction(expression).ast;
    if (isPresent(type)) {
      expect(ast).toBeAnInstanceOf(type);
    }
    expect(unparser.unparse(ast)).toEqual(expression);
  }

  describe('Unparser', () => {
    it('should support AccessMember', () => {
      check('a', AccessMember);
      check('a.b', AccessMember);
    });

    it('should support Assignment', () => { check('a = b', Assignment); });

    it('should support Binary', () => { check('a && b', Binary); });

    it('should support Chain', () => { check('a; b;', Chain); });

    it('should support Conditional', () => { check('a ? b : c', Conditional); });

    it('should support Pipe', () => {
      var originalExp = '(a | b)';
      var ast = parseBinding(originalExp).ast;
      expect(ast).toBeAnInstanceOf(Pipe);
      expect(unparser.unparse(ast)).toEqual(originalExp);
    });

    it('should support KeyedAccess', () => { check('a[b]', KeyedAccess); });

    it('should support LiteralArray', () => { check('[a, b]', LiteralArray); });

    it('should support LiteralMap', () => { check('{a: b, c: d}', LiteralMap); });

    it('should support LiteralPrimitive', () => {
      check('true', LiteralPrimitive);
      check('"a"', LiteralPrimitive);
      check('1.234', LiteralPrimitive);
    });

    it('should support MethodCall', () => {
      check('a(b, c)', MethodCall);
      check('a.b(c, d)', MethodCall);
    });

    it('should support PrefixNot', () => { check('!a', PrefixNot); });

    it('should support SafeAccessMember', () => { check('a?.b', SafeAccessMember); });

    it('should support SafeMethodCall', () => { check('a?.b(c, d)', SafeMethodCall); });

    it('should support if statements', () => {
      var ifs = [
        'if (true) a()',
        'if (true) a() else b()',
        'if (a()) { b = 1; c = 2; }',
        'if (a()) b = 1 else { c = 2; d = e(); }'
      ];

      ifs.forEach(ifStmt => check(ifStmt, If));
    });

    it('should support complex expression', () => {
      var originalExp = 'a + 3 * fn([(c + d | e).f], {a: 3})[g].h && i';
      var ast = parseBinding(originalExp).ast;
      expect(unparser.unparse(ast)).toEqual(originalExp);
    });

    it('should support Interpolation', () => {
      var ast = parser.parseInterpolation('a {{ b }}', null).ast;
      expect(ast).toBeAnInstanceOf(Interpolation);
      expect(unparser.unparse(ast)).toEqual('a {{ b }}');

      ast = parser.parseInterpolation('a {{ b }} c', null).ast;
      expect(ast).toBeAnInstanceOf(Interpolation);
      expect(unparser.unparse(ast)).toEqual('a {{ b }} c');
    });

    it('should support EmptyExpr', () => {
      var ast = parser.parseAction('if (true) { }', null).ast;
      expect(ast).toBeAnInstanceOf(If);
      expect((<If>ast).trueExp).toBeAnInstanceOf(EmptyExpr);
      expect(unparser.unparse(ast)).toEqual('if (true) {  }');
    });
  });
}

import {ddescribe, describe, it, xit, iit, expect, beforeEach, IS_DARTIUM} from 'angular2/test_lib';
import {BaseException, isBlank, isPresent} from 'angular2/src/facade/lang';
import {reflector} from 'angular2/src/reflection/reflection';
import {MapWrapper, ListWrapper} from 'angular2/src/facade/collection';
import {Parser} from 'angular2/src/change_detection/parser/parser';
import {Unparser} from './unparser';
import {Lexer} from 'angular2/src/change_detection/parser/lexer';
import {Locals} from 'angular2/src/change_detection/parser/locals';
import {Pipe, LiteralPrimitive} from 'angular2/src/change_detection/parser/ast';

class TestData {
  constructor(public a?: any, public b?: any, public fnReturnValue?: any) {}

  fn() { return this.fnReturnValue; }

  add(a, b) { return a + b; }
}

export function main() {
  function td(a: any = 0, b: any = 0, fnReturnValue: any = "constant") {
    return new TestData(a, b, fnReturnValue);
  }

  function createParser() { return new Parser(new Lexer(), reflector); }

  function parseAction(text, location = null): any {
    return createParser().parseAction(text, location);
  }

  function parseBinding(text, location = null): any {
    return createParser().parseBinding(text, location);
  }

  function parseTemplateBindings(text, location = null): any {
    return createParser().parseTemplateBindings(text, location);
  }

  function parseInterpolation(text, location = null): any {
    return createParser().parseInterpolation(text, location);
  }

  function addPipes(ast, pipes): any { return createParser().addPipes(ast, pipes); }

  function emptyLocals() { return new Locals(null, MapWrapper.create()); }

  function evalAction(text, passedInContext = null, passedInLocals = null) {
    var c = isBlank(passedInContext) ? td() : passedInContext;
    var l = isBlank(passedInLocals) ? emptyLocals() : passedInLocals;
    return parseAction(text).eval(c, l);
  }

  function expectEval(text, passedInContext = null, passedInLocals = null) {
    return expect(evalAction(text, passedInContext, passedInLocals));
  }

  function expectEvalError(text, passedInContext = null, passedInLocals = null) {
    var c = isBlank(passedInContext) ? td() : passedInContext;
    var l = isBlank(passedInLocals) ? emptyLocals() : passedInLocals;
    return expect(() => parseAction(text).eval(c, l));
  }

  function evalAsts(asts, passedInContext = null) {
    var c = isBlank(passedInContext) ? td() : passedInContext;
    var res = [];
    for (var i = 0; i < asts.length; i++) {
      ListWrapper.push(res, asts[i].eval(c, emptyLocals()));
    }
    return res;
  }

  describe("parser", () => {
    describe("parseAction", () => {
      describe("basic expressions", () => {
        it('should parse numerical expressions', () => { expectEval("1").toEqual(1); });

        it('should parse strings', () => {
          expectEval("'1'").toEqual('1');
          expectEval('"1"').toEqual('1');
        });

        it('should parse null', () => { expectEval("null").toBe(null); });

        it('should parse unary - expressions', () => {
          expectEval("-1").toEqual(-1);
          expectEval("+1").toEqual(1);
        });

        it('should parse unary ! expressions', () => {
          expectEval("!true").toEqual(!true);
          expectEval("!!true").toEqual(!!true);
          expectEval("!!!true").toEqual(!!!true);
        });

        it('should parse multiplicative expressions',
           () => { expectEval("3*4/2%5").toEqual(3 * 4 / 2 % 5); });

        it('should parse additive expressions', () => { expectEval("3+6-2").toEqual(3 + 6 - 2); });

        it('should parse relational expressions', () => {
          expectEval("2<3").toEqual(2 < 3);
          expectEval("2>3").toEqual(2 > 3);
          expectEval("2<=2").toEqual(2 <= 2);
          expectEval("2>=2").toEqual(2 >= 2);
        });

        it('should parse equality expressions', () => {
          expectEval("2==3").toEqual(2 == 3);
          expectEval("2=='2'").toEqual(2 == <any>'2');
          expectEval("2=='3'").toEqual(2 == <any>'3');
          expectEval("2!=3").toEqual(2 != 3);
          expectEval("2!='3'").toEqual(2 != <any>'3');
          expectEval("2!='2'").toEqual(2 != <any>'2');
          expectEval("2!=!false").toEqual(2 != <any>!false);
        });

        it('should parse strict equality expressions', () => {
          expectEval("2===3").toEqual(2 === 3);
          expectEval("2==='3'").toEqual(2 === <any>'3');
          expectEval("2==='2'").toEqual(2 === <any>'2');
          expectEval("2!==3").toEqual(2 !== 3);
          expectEval("2!=='3'").toEqual(2 !== <any>'3');
          expectEval("2!=='2'").toEqual(2 !== <any>'2');
          expectEval("false===!true").toEqual(false === !true);
          expectEval("false!==!!true").toEqual(false !== !!true);
        });

        it('should parse logicalAND expressions', () => {
          expectEval("true&&true").toEqual(true && true);
          expectEval("true&&false").toEqual(true && false);
        });

        it('should parse logicalOR expressions', () => {
          expectEval("false||true").toEqual(false || true);
          expectEval("false||false").toEqual(false || false);
        });

        it('should short-circuit AND operator',
           () => { expectEval('false && a()', td(() => {throw "BOOM"})).toBe(false); });

        it('should short-circuit OR operator',
           () => { expectEval('true || a()', td(() => {throw "BOOM"})).toBe(true); });

        it('should evaluate grouped expressions',
           () => { expectEval("(1+2)*3").toEqual((1 + 2) * 3); });

        it('should parse an empty string', () => { expectEval('').toBeNull(); });
      });

      describe("literals", () => {
        it('should evaluate array', () => {
          expectEval("[1][0]").toEqual(1);
          expectEval("[[1]][0][0]").toEqual(1);
          expectEval("[]").toEqual([]);
          expectEval("[].length").toEqual(0);
          expectEval("[1, 2].length").toEqual(2);
        });

        it('should evaluate map', () => {
          expectEval("{}").toEqual({});
          expectEval("{a:'b'}['a']").toEqual('b');
          expectEval("{'a':'b'}['a']").toEqual('b');
          expectEval("{\"a\":'b'}['a']").toEqual('b');
          expectEval("{\"a\":'b'}['a']").toEqual("b");
          expectEval("{}['a']").not.toBeDefined();
          expectEval("{\"a\":'b'}['invalid']").not.toBeDefined();
        });

        it('should only allow identifier, string, or keyword as map key', () => {
          expectEvalError('{(:0}')
              .toThrowError(new RegExp('expected identifier, keyword, or string'));
          expectEvalError('{1234:0}')
              .toThrowError(new RegExp('expected identifier, keyword, or string'));
        });
      });

      describe("member access", () => {
        it("should parse field access", () => {
          expectEval("a", td(999)).toEqual(999);
          expectEval("a.a", td(td(999))).toEqual(999);
        });

        it('should throw when accessing a field on null',
           () => { expectEvalError("a.a.a").toThrowError(); });

        it('should only allow identifier or keyword as member names', () => {
          expectEvalError('x.(').toThrowError(new RegExp('identifier or keyword'));
          expectEvalError('x. 1234').toThrowError(new RegExp('identifier or keyword'));
          expectEvalError('x."foo"').toThrowError(new RegExp('identifier or keyword'));
        });

        it("should read a field from Locals", () => {
          var locals = new Locals(null, MapWrapper.createFromPairs([["key", "value"]]));
          expectEval("key", null, locals).toEqual("value");
        });

        it("should handle nested Locals", () => {
          var nested = new Locals(null, MapWrapper.createFromPairs([["key", "value"]]));
          var locals = new Locals(nested, MapWrapper.create());
          expectEval("key", null, locals).toEqual("value");
        });

        it("should fall back to a regular field read when Locals " +
               "does not have the requested field",
           () => {
             var locals = new Locals(null, MapWrapper.create());
             expectEval("a", td(999), locals).toEqual(999);
           });
      });

      describe('safe navigation operator', () => {
        it('should parse field access', () => {
          expectEval('a?.a', td(td(999))).toEqual(999);
          expectEval('a.a?.a', td(td(td(999)))).toEqual(999);
        });

        it('should return null when accessing a field on null',
           () => { expect(() => { expectEval('null?.a', td()).toEqual(null); }).not.toThrow(); });

        it('should have the same priority as .', () => {
          expect(() => { expectEval('null?.a.a', td()).toEqual(null); }).toThrowError();
        });

        if (!IS_DARTIUM) {
          it('should return null when accessing a field on undefined', () => {
            expect(() => { expectEval('_undefined?.a', td()).toEqual(null); }).not.toThrow();
          });
        }

        it('should evaluate method calls',
           () => { expectEval('a?.add(1,2)', td(td())).toEqual(3); });

        it('should return null when accessing a method on null', () => {
          expect(() => { expectEval('null?.add(1, 2)', td()).toEqual(null); }).not.toThrow();
        });
      });

      describe("method calls", () => {
        it("should evaluate method calls", () => {
          expectEval("fn()", td(0, 0, "constant")).toEqual("constant");
          expectEval("add(1,2)").toEqual(3);
          expectEval("a.add(1,2)", td(td())).toEqual(3);
          expectEval("fn().add(1,2)", td(0, 0, td())).toEqual(3);
        });

        it('should throw when more than 10 arguments', () => {
          expectEvalError("fn(1,2,3,4,5,6,7,8,9,10,11)").toThrowError(new RegExp('more than'));
        });

        it('should throw when no method', () => { expectEvalError("blah()").toThrowError(); });

        it('should evaluate a method from Locals', () => {
          var locals = new Locals(null, MapWrapper.createFromPairs([['fn', () => 'child']]));
          expectEval("fn()", td(0, 0, 'parent'), locals).toEqual('child');
        });

        it('should fall back to the parent context when Locals does not ' +
               'have the requested method',
           () => {
             var locals = new Locals(null, MapWrapper.create());
             expectEval("fn()", td(0, 0, 'parent'), locals).toEqual('parent');
           });
      });

      describe("functional calls", () => {
        it("should evaluate function calls",
           () => { expectEval("fn()(1,2)", td(0, 0, (a, b) => a + b)).toEqual(3); });

        it('should throw on non-function function calls',
           () => { expectEvalError("4()").toThrowError(new RegExp('4 is not a function')); });

        it('should parse functions for object indices',
           () => { expectEval('a[b()]()', td([() => 6], () => 0)).toEqual(6); });
      });

      describe("conditional", () => {
        it('should parse ternary/conditional expressions', () => {
          expectEval("7==3+4?10:20").toEqual(10);
          expectEval("false?10:20").toEqual(20);
        });

        it('should throw on incorrect ternary operator syntax', () => {
          expectEvalError("true?1").toThrowError(new RegExp(
              'Parser Error: Conditional expression true\\?1 requires all 3 expressions'));
        });
      });

      describe("if", () => {
        it('should parse if statements', () => {

          var fixtures = [
            ['if (true) a = 0', 0, null],
            ['if (false) a = 0', null, null],
            ['if (a == null) b = 0', null, 0],
            ['if (true) { a = 0; b = 0 }', 0, 0],
            ['if (true) { a = 0; b = 0 } else { a = 1; b = 1; }', 0, 0],
            ['if (false) { a = 0; b = 0 } else { a = 1; b = 1; }', 1, 1],
            ['if (false) { } else { a = 1; b = 1; }', 1, 1],
          ];

          fixtures.forEach(fix => {
            var testData = td(null, null);
            evalAction(fix[0], testData);
            expect(testData.a).toEqual(fix[1]);
            expect(testData.b).toEqual(fix[2]);
          });
        });
      });

      describe("assignment", () => {
        it("should support field assignments", () => {
          var context = td();
          expectEval("a=12", context).toEqual(12);
          expect(context.a).toEqual(12);
        });

        it("should support nested field assignments", () => {
          var context = td(td(td()));
          expectEval("a.a.a=123;", context).toEqual(123);
          expect(context.a.a.a).toEqual(123);
        });

        it("should support multiple assignments", () => {
          var context = td();
          expectEval("a=123; b=234", context).toEqual(234);
          expect(context.a).toEqual(123);
          expect(context.b).toEqual(234);
        });

        it("should support array updates", () => {
          var context = td([100]);
          expectEval('a[0] = 200', context).toEqual(200);
          expect(context.a[0]).toEqual(200);
        });

        it("should support map updates", () => {
          var context = td({"key": 100});
          expectEval('a["key"] = 200', context).toEqual(200);
          expect(context.a["key"]).toEqual(200);
        });

        it("should support array/map updates", () => {
          var context = td([{"key": 100}]);
          expectEval('a[0]["key"] = 200', context).toEqual(200);
          expect(context.a[0]["key"]).toEqual(200);
        });

        it('should allow assignment after array dereference', () => {
          var context = td([td()]);
          expectEval('a[0].a = 200', context).toEqual(200);
          expect(context.a[0].a).toEqual(200);
        });

        it('should throw on bad assignment', () => {
          expectEvalError("5=4").toThrowError(new RegExp("Expression 5 is not assignable"));
        });

        it('should reassign when no variable binding with the given name', () => {
          var context = td();
          var locals = new Locals(null, MapWrapper.create());
          expectEval('a = 200', context, locals).toEqual(200);
          expect(context.a).toEqual(200);
        });

        it('should throw when reassigning a variable binding', () => {
          var locals = new Locals(null, MapWrapper.createFromPairs([["key", "value"]]));
          expectEvalError('key = 200', null, locals)
              .toThrowError(new RegExp("Cannot reassign a variable binding"));
        });
      });

      describe("general error handling", () => {
        it("should throw on an unexpected token", () => {
          expectEvalError("[1,2] trac").toThrowError(new RegExp('Unexpected token \'trac\''));
        });

        it('should throw a reasonable error for unconsumed tokens', () => {
          expectEvalError(")")
              .toThrowError(new RegExp("Unexpected token \\) at column 1 in \\[\\)\\]"));
        });

        it('should throw on missing expected token', () => {
          expectEvalError("a(b").toThrowError(
              new RegExp("Missing expected \\) at the end of the expression \\[a\\(b\\]"));
        });
      });

      it("should error when using pipes",
         () => { expectEvalError('x|blah').toThrowError(new RegExp('Cannot have a pipe')); });

      it('should pass exceptions', () => {
        expect(() => {
          parseAction('a()').eval(td(() => {throw new BaseException("boo to you")}), emptyLocals());
        }).toThrowError('boo to you');
      });

      describe("multiple statements", () => {
        it("should return the last non-blank value", () => {
          expectEval("a=1;b=3;a+b").toEqual(4);
          expectEval("1;;").toEqual(1);
        });
      });

      it('should store the source in the result',
         () => { expect(parseAction('someExpr').source).toBe('someExpr'); });

      it('should store the passed-in location',
         () => { expect(parseAction('someExpr', 'location').location).toBe('location'); });
    });

    describe("parseBinding", () => {
      describe("pipes", () => {
        it("should parse pipes", () => {
          var originalExp = '"Foo" | uppercase';
          var ast = parseBinding(originalExp).ast;
          expect(ast).toBeAnInstanceOf(Pipe);
          expect(new Unparser().unparse(ast)).toEqual(`(${originalExp})`);
        });

        it("should parse pipes in the middle of a binding", () => {
          var ast = parseBinding('(user | a | b).name').ast;
          expect(new Unparser().unparse(ast)).toEqual('((user | a) | b).name');
        });

        it("should parse pipes with args", () => {
          var ast = parseBinding("(1|a:2)|b:3").ast;
          expect(new Unparser().unparse(ast)).toEqual('((1 | a:2) | b:3)');
        });

        it('should only allow identifier or keyword as formatter names', () => {
          expect(() => parseBinding('"Foo"|(')).toThrowError(new RegExp('identifier or keyword'));
          expect(() => parseBinding('"Foo"|1234'))
              .toThrowError(new RegExp('identifier or keyword'));
          expect(() => parseBinding('"Foo"|"uppercase"'))
              .toThrowError(new RegExp('identifier or keyword'));
        });

        it('should parse pipes', () => {
          let unparser = new Unparser();
          let exps = [
            ['a(b | c)', 'a((b | c))'],
            ['a.b(c.d(e) | f)', 'a.b((c.d(e) | f))'],
            ['[1, 2, 3] | a', '([1, 2, 3] | a)'],
            ['{a: 1} | b', '({a: 1} | b)'],
            ['a[b] | c', '(a[b] | c)'],
            ['a?.b | c', '(a?.b | c)'],
            ['true | a', '(true | a)'],
            ['a | b:c | d', '(a | b:(c | d))'],
            ['(a | b:c) | d', '((a | b:c) | d)']
          ];

          ListWrapper.forEach(exps, e => {
            var ast = parseBinding(e[0]).ast;
            expect(unparser.unparse(ast)).toEqual(e[1]);
          });
        });
      });

      it('should store the source in the result',
         () => { expect(parseBinding('someExpr').source).toBe('someExpr'); });

      it('should store the passed-in location',
         () => { expect(parseBinding('someExpr', 'location').location).toBe('location'); });

      it('should throw on chain expressions', () => {
        expect(() => parseBinding("1;2")).toThrowError(new RegExp("contain chained expression"));
      });

      it('should throw on assignment', () => {
        expect(() => parseBinding("1;2")).toThrowError(new RegExp("contain chained expression"));
      });
    });

    describe('parseTemplateBindings', () => {

      function keys(templateBindings) {
        return ListWrapper.map(templateBindings, (binding) => binding.key);
      }

      function keyValues(templateBindings) {
        return ListWrapper.map(templateBindings, (binding) => {
          if (binding.keyIsVar) {
            return '#' + binding.key + (isBlank(binding.name) ? '=null' : '=' + binding.name);
          } else {
            return binding.key + (isBlank(binding.expression) ? '' : `=${binding.expression}`)
          }
        });
      }

      function exprSources(templateBindings) {
        return ListWrapper.map(templateBindings, (binding) => isPresent(binding.expression) ?
                                                                  binding.expression.source :
                                                                  null);
      }

      function exprAsts(templateBindings) {
        return ListWrapper.map(templateBindings, (binding) => isPresent(binding.expression) ?
                                                                  binding.expression :
                                                                  null);
      }

      it('should parse an empty string', () => {
        var bindings = parseTemplateBindings('');
        expect(bindings).toEqual([]);
      });

      it('should parse a string without a value', () => {
        var bindings = parseTemplateBindings('a');
        expect(keys(bindings)).toEqual(['a']);
      });

      it('should only allow identifier, string, or keyword including dashes as keys', () => {
        var bindings = parseTemplateBindings("a:'b'");
        expect(keys(bindings)).toEqual(['a']);

        bindings = parseTemplateBindings("'a':'b'");
        expect(keys(bindings)).toEqual(['a']);

        bindings = parseTemplateBindings("\"a\":'b'");
        expect(keys(bindings)).toEqual(['a']);

        bindings = parseTemplateBindings("a-b:'c'");
        expect(keys(bindings)).toEqual(['a-b']);

        expect(() => { parseTemplateBindings('(:0'); })
            .toThrowError(new RegExp('expected identifier, keyword, or string'));

        expect(() => { parseTemplateBindings('1234:0'); })
            .toThrowError(new RegExp('expected identifier, keyword, or string'));
      });

      it('should detect expressions as value', () => {
        var bindings = parseTemplateBindings("a:b");
        expect(exprSources(bindings)).toEqual(['b']);
        expect(evalAsts(exprAsts(bindings), td(0, 23))).toEqual([23]);

        bindings = parseTemplateBindings("a:1+1");
        expect(exprSources(bindings)).toEqual(['1+1']);
        expect(evalAsts(exprAsts(bindings))).toEqual([2]);
      });

      it('should detect names as value', () => {
        var bindings = parseTemplateBindings("a:#b");
        expect(keyValues(bindings)).toEqual(['a', '#b=\$implicit']);
      });

      it('should allow space and colon as separators', () => {
        var bindings = parseTemplateBindings("a:b");
        expect(keys(bindings)).toEqual(['a']);
        expect(exprSources(bindings)).toEqual(['b']);

        bindings = parseTemplateBindings("a b");
        expect(keys(bindings)).toEqual(['a']);
        expect(exprSources(bindings)).toEqual(['b']);
      });

      it('should allow multiple pairs', () => {
        var bindings = parseTemplateBindings("a 1 b 2");
        expect(keys(bindings)).toEqual(['a', 'a-b']);
        expect(exprSources(bindings)).toEqual(['1 ', '2']);
      });

      it('should store the sources in the result', () => {
        var bindings = parseTemplateBindings("a 1,b 2");
        expect(bindings[0].expression.source).toEqual('1');
        expect(bindings[1].expression.source).toEqual('2');
      });

      it('should store the passed-in location', () => {
        var bindings = parseTemplateBindings("a 1,b 2", 'location');
        expect(bindings[0].expression.location).toEqual('location');
      });

      it('should support var/# notation', () => {
        var bindings = parseTemplateBindings("var i");
        expect(keyValues(bindings)).toEqual(['#i=\$implicit']);

        bindings = parseTemplateBindings("#i");
        expect(keyValues(bindings)).toEqual(['#i=\$implicit']);

        bindings = parseTemplateBindings("var a; var b");
        expect(keyValues(bindings)).toEqual(['#a=\$implicit', '#b=\$implicit']);

        bindings = parseTemplateBindings("#a; #b;");
        expect(keyValues(bindings)).toEqual(['#a=\$implicit', '#b=\$implicit']);

        bindings = parseTemplateBindings("var i-a = k-a");
        expect(keyValues(bindings)).toEqual(['#i-a=k-a']);

        bindings = parseTemplateBindings("keyword var item; var i = k");
        expect(keyValues(bindings)).toEqual(['keyword', '#item=\$implicit', '#i=k']);

        bindings = parseTemplateBindings("keyword: #item; #i = k");
        expect(keyValues(bindings)).toEqual(['keyword', '#item=\$implicit', '#i=k']);

        bindings = parseTemplateBindings("directive: var item in expr; var a = b", 'location');
        expect(keyValues(bindings))
            .toEqual(['directive', '#item=\$implicit', 'directive-in=expr in location', '#a=b']);
      });

      it('should parse pipes', () => {
        var bindings = parseTemplateBindings('key value|pipe');
        var ast = bindings[0].expression.ast;
        expect(ast).toBeAnInstanceOf(Pipe);
      });
    });

    describe('parseInterpolation', () => {
      it('should return null if no interpolation',
         () => { expect(parseInterpolation('nothing')).toBe(null); });

      it('should parse no prefix/suffix interpolation', () => {
        var ast = parseInterpolation('{{a}}').ast;
        expect(ast.strings).toEqual(['', '']);
        expect(ast.expressions.length).toEqual(1);
        expect(ast.expressions[0].name).toEqual('a');
      });

      it('should parse prefix/suffix with multiple interpolation', () => {
        var originalExp = 'before {{ a }} middle {{ b }} after';
        var ast = parseInterpolation(originalExp).ast;
        expect(new Unparser().unparse(ast)).toEqual(originalExp);
      });
    });

    describe('addPipes', () => {
      it('should return the given ast whe the list of pipes is empty', () => {
        var ast = parseBinding("1 + 1", "Location");
        var transformedAst = addPipes(ast, []);
        expect(transformedAst).toBe(ast);
      });

      it('should append pipe ast nodes', () => {
        var ast = parseBinding("1 + 1", "Location");
        var transformedAst = addPipes(ast, ['one', 'two']);
        expect(transformedAst.ast.name).toEqual("two");
        expect(transformedAst.ast.exp.name).toEqual("one");
        expect(transformedAst.ast.exp.exp.operation).toEqual("+");
      });

      it('should preserve location and source', () => {
        var ast = parseBinding("1 + 1", "Location");
        var transformedAst = addPipes(ast, ['one', 'two']);
        expect(transformedAst.source).toEqual("1 + 1");
        expect(transformedAst.location).toEqual("Location");
      });
    });

    describe('wrapLiteralPrimitive', () => {
      it('should wrap a literal primitive', () => {
        expect(createParser().wrapLiteralPrimitive("foo", null).eval(null, emptyLocals()))
            .toEqual("foo");
      });
    });
  });
}

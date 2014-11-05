import {ddescribe, describe, it, iit, expect, beforeEach} from 'test_lib/test_lib';
import {BaseException, isBlank} from 'facade/lang';
import {MapWrapper} from 'facade/collection';
import {Parser} from 'change_detection/parser/parser';
import {Lexer} from 'change_detection/parser/lexer';
import {Formatter, LiteralPrimitive} from 'change_detection/parser/ast';
import {ClosureMap} from 'change_detection/parser/closure_map';

class TestData {
  constructor(a, b, fnReturnValue) {
    this.a = a;
    this.b = b;
    this.fnReturnValue = fnReturnValue;
  }

  fn() {
    return this.fnReturnValue;
  }

  add(a, b) {
    return a + b;
  }
}

class ContextWithErrors {
  get boo() {
    throw new BaseException("boo to you");
  }
}

export function main() {
  function td(a = 0, b = 0, fnReturnValue = "constant") {
    return new TestData(a, b, fnReturnValue);
  }

  function createParser() {
    return new Parser(new Lexer(), new ClosureMap());
  }

  function parseAction(text) {
    return createParser().parseAction(text);
  }

  function parseBinding(text) {
    return createParser().parseBinding(text);
  }

  function expectEval(text, passedInContext = null) {
    var c = isBlank(passedInContext) ? td() : passedInContext;
    return expect(parseAction(text).eval(c));
  }

  function expectEvalError(text) {
    return expect(() => parseAction(text).eval(td()));
  }

  describe("parser", () => {
    describe("parseAction", () => {
      it("should parse field access", () => {
        expectEval("a", td(999)).toEqual(999);
        expectEval("a.a", td(td(999))).toEqual(999);
      });

      it('should throw when accessing a field on null', () => {
        expectEvalError("a.a.a").toThrowError();
      });

      it('should parse numerical expressions', () => {
        expectEval("1").toEqual(1);
      });

      it('should parse unary - expressions', () => {
        expectEval("-1").toEqual(-1);
        expectEval("+1").toEqual(1);
      });

      it('should parse unary ! expressions', () => {
        expectEval("!true").toEqual(!true);
      });

      it('should parse multiplicative expressions', () => {
        expectEval("3*4/2%5").toEqual(3 * 4 / 2 % 5);
      });

      it('should parse additive expressions', () => {
        expectEval("3+6-2").toEqual(3 + 6 - 2);
      });

      it('should parse relational expressions', () => {
        expectEval("2<3").toEqual(2 < 3);
        expectEval("2>3").toEqual(2 > 3);
        expectEval("2<=2").toEqual(2 <= 2);
        expectEval("2>=2").toEqual(2 >= 2);
      });

      it('should parse equality expressions', () => {
        expectEval("2==3").toEqual(2 == 3);
        expectEval("2!=3").toEqual(2 != 3);
      });

      it('should parse logicalAND expressions', () => {
        expectEval("true&&true").toEqual(true && true);
        expectEval("true&&false").toEqual(true && false);
      });

      it('should parse logicalOR expressions', () => {
        expectEval("false||true").toEqual(false || true);
        expectEval("false||false").toEqual(false || false);
      });

      it('should parse ternary/conditional expressions', () => {
        expectEval("7==3+4?10:20").toEqual(10);
        expectEval("false?10:20").toEqual(20);
      });

      it('should throw on incorrect ternary operator syntax', () => {
        expectEvalError("true?1").
          toThrowError(new RegExp('Parser Error: Conditional expression true\\?1 requires all 3 expressions'));
      });

      it('should auto convert ints to strings', () => {
        expectEval("'str ' + 4").toEqual("str 4");
        expectEval("4 + ' str'").toEqual("4 str");
        expectEval("4 + 4").toEqual(8);
        expectEval("4 + 4 + ' str'").toEqual("8 str");
        expectEval("'str ' + 4 + 4").toEqual("str 44");
      });

      it('should eval binary operators with null as null', () => {
        expectEvalError("null < 0").toThrowError();
        expectEvalError("null * 3").toThrowError();
        expectEvalError("null + 6").toThrowError();
        expectEvalError("5 + null").toThrowError();
        expectEvalError("null - 4").toThrowError();
        expectEvalError("3 - null").toThrowError();
        expectEvalError("null + null").toThrowError();
        expectEvalError("null - null").toThrowError();
      });

      it('should only allow identifier or keyword as member names', () => {
        expect(() => parseAction("x.(")).toThrowError(new RegExp('identifier or keyword'));
        expect(() => parseAction('x. 1234')).toThrowError(new RegExp('identifier or keyword'));
        expect(() => parseAction('x."foo"')).toThrowError(new RegExp('identifier or keyword'));
      });

      it("should error when using formatters", () => {
        expectEvalError('x|blah').toThrowError(new RegExp('Cannot have a formatter'));
      });

      it('should pass exceptions', () => {
        expect(() => {
          createParser().parseAction('boo').eval(new ContextWithErrors());
        }).toThrowError('boo to you');
      });

      it('should evaluate assignments', () => {
        var context = td();
        expectEval("a=12", context).toEqual(12);
        expect(context.a).toEqual(12);

        context = td(td(td()));
        expectEval("a.a.a=123;", context).toEqual(123);
        expect(context.a.a.a).toEqual(123);

        context = td();
        expectEval("a=123; b=234", context).toEqual(234);
        expect(context.a).toEqual(123);
        expect(context.b).toEqual(234);

        context = td([100]);
        expectEval('a[0] = 200', context).toEqual(200);
        expect(context.a[0]).toEqual(200);

        context = td(MapWrapper.createFromPairs([["key", 100]]));
        expectEval('a["key"] = 200', context).toEqual(200);
        expect(MapWrapper.get(context.a, "key")).toEqual(200);

        context = td([MapWrapper.createFromPairs([["key", 100]])]);
        expectEval('a[0]["key"] = 200', context).toEqual(200);
        expect(MapWrapper.get(context.a[0], "key")).toEqual(200);
      });

      it('should throw on bad assignment', () => {
        expectEvalError("5=4").toThrowError(new RegExp("Expression 5 is not assignable"));
      });

      it("should evaluate method calls", () => {
        expectEval("fn()", td(0,0, "constant")).toEqual("constant");
        expectEval("add(1,2)").toEqual(3);
        expectEval("a.add(1,2)", td(td())).toEqual(3);
        expectEval("fn().add(1,2)", td(0,0,td())).toEqual(3);
      });

      it("should evaluate function calls", () => {
        expectEval("fn()(1,2)", td(0, 0, (a,b) => a + b)).toEqual(3);
      });

      it('should evaluate array', () => {
        expectEval("[1][0]").toEqual(1);
        expectEval("[[1]][0][0]").toEqual(1);
        expectEval("[]").toEqual([]);
        expectEval("[].length").toEqual(0);
        expectEval("[1, 2].length").toEqual(2);
      });

      it("should error when unfinished exception", () => {
        expectEvalError('a[0').toThrowError(new RegExp("Missing expected ]"));
      });

      it('should evaluate map', () => {
        expectEval("{}").toEqual(MapWrapper.create());
        expectEval("{a:'b'}").toEqual(MapWrapper.createFromPairs([["a", "b"]]));
        expectEval("{'a':'b'}").toEqual(MapWrapper.createFromPairs([["a", "b"]]));
        expectEval("{\"a\":'b'}").toEqual(MapWrapper.createFromPairs([["a", "b"]]));
        expectEval("{\"a\":'b'}['a']").toEqual("b");
        expectEval("{\"a\":'b'}['invalid']").not.toBeDefined();
      });

      describe("parseBinding", () => {
        it("should parse formatters", function () {
          var exp = parseBinding("'Foo'|uppercase");
          expect(exp).toBeAnInstanceOf(Formatter);
          expect(exp.name).toEqual("uppercase");
        });

        it("should parse formatters with args", function () {
          var exp = parseBinding("1|increment:2");
          expect(exp).toBeAnInstanceOf(Formatter);
          expect(exp.name).toEqual("increment");
          expect(exp.args[0]).toBeAnInstanceOf(LiteralPrimitive);
        });

        it('should throw on chain expressions', () => {
          expect(() => parseBinding("1;2")).toThrowError(new RegExp("contain chained expression"));
        });
      });
    });
  });
}


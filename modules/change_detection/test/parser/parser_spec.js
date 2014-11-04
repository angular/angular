import {ddescribe, describe, it, iit, expect, beforeEach} from 'test_lib/test_lib';
import {BaseException, isBlank} from 'facade/lang';
import {Parser} from 'change_detection/parser/parser';
import {Lexer} from 'change_detection/parser/lexer';
import {Formatter, LiteralPrimitive} from 'change_detection/parser/ast';
import {ClosureMap} from 'change_detection/parser/closure_map';

class TestData {
  constructor(a, b) {
    this.a = a;
    this.b = b;
  }

  constant() {
    return "constant";
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
  function td(a = 0, b = 0) {
    return new TestData(a, b);
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

      it('should auto convert ints to strings', () => {
        expectEval("'str ' + 4").toEqual("str 4");
        expectEval("4 + ' str'").toEqual("4 str");
        expectEval("4 + 4").toEqual(8);
        expectEval("4 + 4 + ' str'").toEqual("8 str");
        expectEval("'str ' + 4 + 4").toEqual("str 44");
      });

      it('should behave gracefully with a null scope', () => {
        var exp = createParser().parseAction("null");
        expect(exp.eval(null)).toEqual(null);
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

      describe("error handling", () => {
        it('should throw on incorrect ternary operator syntax', () => {
          expectEvalError("true?1").
            toThrowError(new RegExp('Parser Error: Conditional expression true\\?1 requires all 3 expressions'));
        });

        it('should pass exceptions', () => {
          expect(() => {
            createParser().parseAction('boo').eval(new ContextWithErrors());
          }).toThrowError('boo to you');
        });

        it('should only allow identifier or keyword as member names', () => {
          expect(() => parseAction("x.(")).toThrowError(new RegExp('identifier or keyword'));
          expect(() => parseAction('x. 1234')).toThrowError(new RegExp('identifier or keyword'));
          expect(() => parseAction('x."foo"')).toThrowError(new RegExp('identifier or keyword'));
        });

        it("should error when using formatters", () => {
          expectEvalError('x|blah').toThrowError(new RegExp('Cannot have a formatter'));
        });
      });
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
}

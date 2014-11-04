import {ddescribe, describe, it, iit, expect, beforeEach} from 'test_lib/test_lib';
import {BaseException} from 'facade/lang';
import {Parser} from 'change_detection/parser/parser';
import {Lexer} from 'change_detection/parser/lexer';
import {ClosureMap} from 'change_detection/parser/closure_map';

class TestData {
  constructor(a, b) {
    this.a = a;
    this.b = b;
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

  var context = td();
  var formatters;

  function createParser() {
    return new Parser(new Lexer(), new ClosureMap());
  }

  function _eval(text) {
    return new Parser(new Lexer(), new ClosureMap()).parse(text)
      .eval(context, formatters);
  }

  function expectEval(text) {
    return expect(_eval(text));
  }

  function expectEvalError(text) {
    return expect(() => _eval(text));
  }

  describe("parser", () => {
    describe("field access", () => {
      var parser;

      beforeEach(() => {
        parser = createParser();
      });

      it("should parse field access",() => {
        var exp = parser.parse("a");
        var context = td(999);
        expect(exp.eval(context, null)).toEqual(999);
      });

      it("should parse nested field access",() => {
        var exp = parser.parse("a.a");
        var context = td(td(999));
        expect(exp.eval(context, null)).toEqual(999);
      });
    });

    describe('expressions', () => {

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
        expectEval("3*4/2%5").toEqual(3*4/2%5);
        // TODO(rado): This exists only in Dart, figure out whether to support it.
        // expectEval("3*4~/2%5")).toEqual(3*4~/2%5);
      });


      it('should parse additive expressions', () => {
        expectEval("3+6-2").toEqual(3+6-2);
      });


      it('should parse relational expressions', () => {
        expectEval("2<3").toEqual(2<3);
        expectEval("2>3").toEqual(2>3);
        expectEval("2<=2").toEqual(2<=2);
        expectEval("2>=2").toEqual(2>=2);
      });


      it('should parse equality expressions', () => {
        expectEval("2==3").toEqual(2==3);
        expectEval("2!=3").toEqual(2!=3);
      });


      it('should parse logicalAND expressions', () => {
        expectEval("true&&true").toEqual(true&&true);
        expectEval("true&&false").toEqual(true&&false);
      });


      it('should parse logicalOR expressions', () => {
        expectEval("false||true").toEqual(false||true);
        expectEval("false||false").toEqual(false||false);
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
        var exp = createParser().parse("null");
        expect(exp.eval(null, null)).toEqual(null);
      });

      it('should eval binary operators with null as null', () => {
        expectEval("null < 0").toBeNull();
        expectEval("null * 3").toBeNull();
        expectEval("null + 6").toBeNull();
        expectEval("5 + null").toBeNull();
        expectEval("null - 4").toBeNull();
        expectEval("3 - null").toBeNull();
        expectEval("null + null").toBeNull();
        expectEval("null - null").toBeNull();
      });
    });

    describe('formatters', () => {
      beforeEach(() => {
        formatters = {
          "uppercase": (s) => s.toUpperCase(),
          "lowercase": (s) => s.toLowerCase(),
          "increment": (a,b) => a + b
        }
      });

      it('should call a formatter', () => {
        expectEval("'Foo'|uppercase").toEqual("FOO");
        expectEval("'fOo'|uppercase|lowercase").toEqual("foo");
      });

      it('should call a formatter with arguments', () => {
        expectEval("1|increment:2").toEqual(3);
      });

      it('should throw when invalid formatter', () => {
        expectEvalError("1|nonexistent").toThrowError('No formatter \'nonexistent\' found!');
      });;

      it('should not allow formatters in a chain', () => {
        expectEvalError("1;'World'|hello").
            toThrowError(new RegExp('Cannot have a formatter in a chain'));
        expectEvalError("'World'|hello;1").
            toThrowError(new RegExp('Cannot have a formatter in a chain'));
      });
    });
    
    describe("error handling", () => {
      it('should throw on incorrect ternary operator syntax', () => {
        expectEvalError("true?1").
            toThrowError(new RegExp('Parser Error: Conditional expression true\\?1 requires all 3 expressions'));
      });

      it('should pass exceptions', () => {
        expect(() => {
          createParser().parse('boo').eval(new ContextWithErrors(), null);
        }).toThrowError('boo to you');
      });

      it('should only allow identifier or keyword as member names', () => {
        expectEvalError('x.(').toThrowError(new RegExp('identifier or keyword'));
        expectEvalError('x. 1234').toThrowError(new RegExp('identifier or keyword'));
        expectEvalError('x."foo"').toThrowError(new RegExp('identifier or keyword'));
      });
    });
  });
}

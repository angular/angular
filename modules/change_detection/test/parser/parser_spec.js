import {ddescribe, describe, it, iit, expect, beforeEach} from 'test_lib/test_lib';
import {Parser} from 'change_detection/parser/parser';
import {Lexer} from 'change_detection/parser/lexer';
import {ClosureMap} from 'change_detection/parser/closure_map';

class TestData {
  constructor(a, b) {
    this.a = a;
    this.b = b;
  }
}

export function main() {
  function td(a = 0, b = 0) {
    return new TestData(a, b);
  }

  var context = td();
  var formatters;

  function _eval(text) {
    return new Parser(new Lexer(), new ClosureMap()).parse(text)
        .eval(context, formatters);
  }

  describe("parser", () => {
    describe("field access", () => {
      var parser;

      beforeEach(() => {
        parser = new Parser(new Lexer(), new ClosureMap());
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
        expect(_eval("1")).toEqual(1);
      });


      it('should parse unary - expressions', () => {
        expect(_eval("-1")).toEqual(-1);
        expect(_eval("+1")).toEqual(1);
      });


      it('should parse unary ! expressions', () => {
        expect(_eval("!true")).toEqual(!true);
      });


      it('should parse multiplicative expressions', () => {
        expect(_eval("3*4/2%5")).toEqual(3*4/2%5);
        // TODO(rado): This exists only in Dart, figure out whether to support it.
        // expect(_eval("3*4~/2%5")).toEqual(3*4~/2%5);
      });


      it('should parse additive expressions', () => {
        expect(_eval("3+6-2")).toEqual(3+6-2);
      });


      it('should parse relational expressions', () => {
        expect(_eval("2<3")).toEqual(2<3);
        expect(_eval("2>3")).toEqual(2>3);
        expect(_eval("2<=2")).toEqual(2<=2);
        expect(_eval("2>=2")).toEqual(2>=2);
      });


      it('should parse equality expressions', () => {
        expect(_eval("2==3")).toEqual(2==3);
        expect(_eval("2!=3")).toEqual(2!=3);
      });


      it('should parse logicalAND expressions', () => {
        expect(_eval("true&&true")).toEqual(true&&true);
        expect(_eval("true&&false")).toEqual(true&&false);
      });


      it('should parse logicalOR expressions', () => {
        expect(_eval("false||true")).toEqual(false||true);
        expect(_eval("false||false")).toEqual(false||false);
      });

      it('should auto convert ints to strings', () => {
        expect(_eval("'str ' + 4")).toEqual("str 4");
        expect(_eval("4 + ' str'")).toEqual("4 str");
        expect(_eval("4 + 4")).toEqual(8);
        expect(_eval("4 + 4 + ' str'")).toEqual("8 str");
        expect(_eval("'str ' + 4 + 4")).toEqual("str 44");
      });
    });
  });
}

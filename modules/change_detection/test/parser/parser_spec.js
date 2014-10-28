import {ddescribe, describe, it, expect, beforeEach} from 'test_lib/test_lib';
import {Parser} from 'change_detection/parser/parser';
import {Lexer} from 'change_detection/parser/lexer';
import {ClosureMap} from 'change_detection/parser/closure_map';

class TestData {
  constructor(a) {
    this.a = a;
  }
}

export function main() {
  function td({a}) {
    return new TestData(a);
  }

  describe("parser", () => {
    describe("field access", () => {
      var parser;

      beforeEach(() => {
        parser = new Parser(new Lexer(), new ClosureMap());
      });

      it("should parse field access",() => {
        var exp = parser.parse("a");
        var context = td({a: 999});
        expect(exp.eval(context)).toEqual(999);
      });

      it("should parse nested field access",() => {
        var exp = parser.parse("a.a");
        var context = td({a: td({a: 999})});
        expect(exp.eval(context)).toEqual(999);
      });
    });
  });
}
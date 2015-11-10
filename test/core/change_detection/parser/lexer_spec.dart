library angular2.test.core.change_detection.parser.lexer_spec;

import "package:angular2/testing_internal.dart"
    show ddescribe, describe, it, expect;
import "package:angular2/src/core/change_detection/parser/lexer.dart"
    show Lexer, Token;
import "package:angular2/src/facade/lang.dart" show StringWrapper;

List<dynamic> lex(String text) {
  return new Lexer().tokenize(text);
}

expectToken(token, index) {
  expect(token is Token).toBe(true);
  expect(token.index).toEqual(index);
}

expectCharacterToken(token, index, character) {
  expect(character.length).toBe(1);
  expectToken(token, index);
  expect(token.isCharacter(StringWrapper.charCodeAt(character, 0))).toBe(true);
}

expectOperatorToken(token, index, operator) {
  expectToken(token, index);
  expect(token.isOperator(operator)).toBe(true);
}

expectNumberToken(token, index, n) {
  expectToken(token, index);
  expect(token.isNumber()).toBe(true);
  expect(token.toNumber()).toEqual(n);
}

expectStringToken(token, index, str) {
  expectToken(token, index);
  expect(token.isString()).toBe(true);
  expect(token.toString()).toEqual(str);
}

expectIdentifierToken(token, index, identifier) {
  expectToken(token, index);
  expect(token.isIdentifier()).toBe(true);
  expect(token.toString()).toEqual(identifier);
}

expectKeywordToken(token, index, keyword) {
  expectToken(token, index);
  expect(token.isKeyword()).toBe(true);
  expect(token.toString()).toEqual(keyword);
}

main() {
  describe("lexer", () {
    describe("token", () {
      it("should tokenize a simple identifier", () {
        List<num> tokens = lex("j");
        expect(tokens.length).toEqual(1);
        expectIdentifierToken(tokens[0], 0, "j");
      });
      it("should tokenize a dotted identifier", () {
        List<num> tokens = lex("j.k");
        expect(tokens.length).toEqual(3);
        expectIdentifierToken(tokens[0], 0, "j");
        expectCharacterToken(tokens[1], 1, ".");
        expectIdentifierToken(tokens[2], 2, "k");
      });
      it("should tokenize an operator", () {
        List<num> tokens = lex("j-k");
        expect(tokens.length).toEqual(3);
        expectOperatorToken(tokens[1], 1, "-");
      });
      it("should tokenize an indexed operator", () {
        List<num> tokens = lex("j[k]");
        expect(tokens.length).toEqual(4);
        expectCharacterToken(tokens[1], 1, "[");
        expectCharacterToken(tokens[3], 3, "]");
      });
      it("should tokenize numbers", () {
        List<num> tokens = lex("88");
        expect(tokens.length).toEqual(1);
        expectNumberToken(tokens[0], 0, 88);
      });
      it("should tokenize numbers within index ops", () {
        expectNumberToken(lex("a[22]")[2], 2, 22);
      });
      it("should tokenize simple quoted strings", () {
        expectStringToken(lex("\"a\"")[0], 0, "a");
      });
      it("should tokenize quoted strings with escaped quotes", () {
        expectStringToken(lex("\"a\\\"\"")[0], 0, "a\"");
      });
      it("should tokenize a string", () {
        List<Token> tokens = lex("j-a.bc[22]+1.3|f:'a\\'c':\"d\\\"e\"");
        expectIdentifierToken(tokens[0], 0, "j");
        expectOperatorToken(tokens[1], 1, "-");
        expectIdentifierToken(tokens[2], 2, "a");
        expectCharacterToken(tokens[3], 3, ".");
        expectIdentifierToken(tokens[4], 4, "bc");
        expectCharacterToken(tokens[5], 6, "[");
        expectNumberToken(tokens[6], 7, 22);
        expectCharacterToken(tokens[7], 9, "]");
        expectOperatorToken(tokens[8], 10, "+");
        expectNumberToken(tokens[9], 11, 1.3);
        expectOperatorToken(tokens[10], 14, "|");
        expectIdentifierToken(tokens[11], 15, "f");
        expectCharacterToken(tokens[12], 16, ":");
        expectStringToken(tokens[13], 17, "a'c");
        expectCharacterToken(tokens[14], 23, ":");
        expectStringToken(tokens[15], 24, "d\"e");
      });
      it("should tokenize undefined", () {
        List<Token> tokens = lex("undefined");
        expectKeywordToken(tokens[0], 0, "undefined");
        expect(tokens[0].isKeywordUndefined()).toBe(true);
      });
      it("should ignore whitespace", () {
        List<Token> tokens = lex("a \t \n \r b");
        expectIdentifierToken(tokens[0], 0, "a");
        expectIdentifierToken(tokens[1], 8, "b");
      });
      it("should tokenize quoted string", () {
        var str = "['\\'', \"\\\"\"]";
        List<Token> tokens = lex(str);
        expectStringToken(tokens[1], 1, "'");
        expectStringToken(tokens[3], 7, "\"");
      });
      it("should tokenize escaped quoted string", () {
        var str = "\"\\\"\\n\\f\\r\\t\\v\\u00A0\"";
        List<Token> tokens = lex(str);
        expect(tokens.length).toEqual(1);
        expect(tokens[0].toString()).toEqual("\"\n\f\r\t\u000b ");
      });
      it("should tokenize unicode", () {
        List<Token> tokens = lex("\"\\u00A0\"");
        expect(tokens.length).toEqual(1);
        expect(tokens[0].toString()).toEqual(" ");
      });
      it("should tokenize relation", () {
        List<Token> tokens = lex("! == != < > <= >= === !==");
        expectOperatorToken(tokens[0], 0, "!");
        expectOperatorToken(tokens[1], 2, "==");
        expectOperatorToken(tokens[2], 5, "!=");
        expectOperatorToken(tokens[3], 8, "<");
        expectOperatorToken(tokens[4], 10, ">");
        expectOperatorToken(tokens[5], 12, "<=");
        expectOperatorToken(tokens[6], 15, ">=");
        expectOperatorToken(tokens[7], 18, "===");
        expectOperatorToken(tokens[8], 22, "!==");
      });
      it("should tokenize statements", () {
        List<Token> tokens = lex("a;b;");
        expectIdentifierToken(tokens[0], 0, "a");
        expectCharacterToken(tokens[1], 1, ";");
        expectIdentifierToken(tokens[2], 2, "b");
        expectCharacterToken(tokens[3], 3, ";");
      });
      it("should tokenize function invocation", () {
        List<Token> tokens = lex("a()");
        expectIdentifierToken(tokens[0], 0, "a");
        expectCharacterToken(tokens[1], 1, "(");
        expectCharacterToken(tokens[2], 2, ")");
      });
      it("should tokenize simple method invocations", () {
        List<Token> tokens = lex("a.method()");
        expectIdentifierToken(tokens[2], 2, "method");
      });
      it("should tokenize method invocation", () {
        List<Token> tokens = lex("a.b.c (d) - e.f()");
        expectIdentifierToken(tokens[0], 0, "a");
        expectCharacterToken(tokens[1], 1, ".");
        expectIdentifierToken(tokens[2], 2, "b");
        expectCharacterToken(tokens[3], 3, ".");
        expectIdentifierToken(tokens[4], 4, "c");
        expectCharacterToken(tokens[5], 6, "(");
        expectIdentifierToken(tokens[6], 7, "d");
        expectCharacterToken(tokens[7], 8, ")");
        expectOperatorToken(tokens[8], 10, "-");
        expectIdentifierToken(tokens[9], 12, "e");
        expectCharacterToken(tokens[10], 13, ".");
        expectIdentifierToken(tokens[11], 14, "f");
        expectCharacterToken(tokens[12], 15, "(");
        expectCharacterToken(tokens[13], 16, ")");
      });
      it("should tokenize number", () {
        List<Token> tokens = lex("0.5");
        expectNumberToken(tokens[0], 0, 0.5);
      });
      // NOTE(deboer): NOT A LEXER TEST

      //    it('should tokenize negative number', () => {

      //      var tokens:Token[] = lex("-0.5");

      //      expectNumberToken(tokens[0], 0, -0.5);

      //    });
      it("should tokenize number with exponent", () {
        List<Token> tokens = lex("0.5E-10");
        expect(tokens.length).toEqual(1);
        expectNumberToken(tokens[0], 0, 0.5E-10);
        tokens = lex("0.5E+10");
        expectNumberToken(tokens[0], 0, 0.5E+10);
      });
      it("should throws exception for invalid exponent", () {
        expect(() {
          lex("0.5E-");
        }).toThrowError(
            "Lexer Error: Invalid exponent at column 4 in expression [0.5E-]");
        expect(() {
          lex("0.5E-A");
        }).toThrowError(
            "Lexer Error: Invalid exponent at column 4 in expression [0.5E-A]");
      });
      it("should tokenize number starting with a dot", () {
        List<Token> tokens = lex(".5");
        expectNumberToken(tokens[0], 0, 0.5);
      });
      it("should throw error on invalid unicode", () {
        expect(() {
          lex("'\\u1''bla'");
        }).toThrowError(
            "Lexer Error: Invalid unicode escape [\\u1''b] at column 2 in expression ['\\u1''bla']");
      });
      it("should tokenize hash as operator", () {
        List<Token> tokens = lex("#");
        expectOperatorToken(tokens[0], 0, "#");
      });
      it("should tokenize ?. as operator", () {
        List<Token> tokens = lex("?.");
        expectOperatorToken(tokens[0], 0, "?.");
      });
    });
  });
}

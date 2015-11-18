var testing_internal_1 = require('angular2/testing_internal');
var lexer_1 = require('angular2/src/core/change_detection/parser/lexer');
var lang_1 = require("angular2/src/facade/lang");
function lex(text) {
    return new lexer_1.Lexer().tokenize(text);
}
function expectToken(token, index) {
    testing_internal_1.expect(token instanceof lexer_1.Token).toBe(true);
    testing_internal_1.expect(token.index).toEqual(index);
}
function expectCharacterToken(token, index, character) {
    testing_internal_1.expect(character.length).toBe(1);
    expectToken(token, index);
    testing_internal_1.expect(token.isCharacter(lang_1.StringWrapper.charCodeAt(character, 0))).toBe(true);
}
function expectOperatorToken(token, index, operator) {
    expectToken(token, index);
    testing_internal_1.expect(token.isOperator(operator)).toBe(true);
}
function expectNumberToken(token, index, n) {
    expectToken(token, index);
    testing_internal_1.expect(token.isNumber()).toBe(true);
    testing_internal_1.expect(token.toNumber()).toEqual(n);
}
function expectStringToken(token, index, str) {
    expectToken(token, index);
    testing_internal_1.expect(token.isString()).toBe(true);
    testing_internal_1.expect(token.toString()).toEqual(str);
}
function expectIdentifierToken(token, index, identifier) {
    expectToken(token, index);
    testing_internal_1.expect(token.isIdentifier()).toBe(true);
    testing_internal_1.expect(token.toString()).toEqual(identifier);
}
function expectKeywordToken(token, index, keyword) {
    expectToken(token, index);
    testing_internal_1.expect(token.isKeyword()).toBe(true);
    testing_internal_1.expect(token.toString()).toEqual(keyword);
}
function main() {
    testing_internal_1.describe('lexer', function () {
        testing_internal_1.describe('token', function () {
            testing_internal_1.it('should tokenize a simple identifier', function () {
                var tokens = lex("j");
                testing_internal_1.expect(tokens.length).toEqual(1);
                expectIdentifierToken(tokens[0], 0, 'j');
            });
            testing_internal_1.it('should tokenize a dotted identifier', function () {
                var tokens = lex("j.k");
                testing_internal_1.expect(tokens.length).toEqual(3);
                expectIdentifierToken(tokens[0], 0, 'j');
                expectCharacterToken(tokens[1], 1, '.');
                expectIdentifierToken(tokens[2], 2, 'k');
            });
            testing_internal_1.it('should tokenize an operator', function () {
                var tokens = lex("j-k");
                testing_internal_1.expect(tokens.length).toEqual(3);
                expectOperatorToken(tokens[1], 1, '-');
            });
            testing_internal_1.it('should tokenize an indexed operator', function () {
                var tokens = lex("j[k]");
                testing_internal_1.expect(tokens.length).toEqual(4);
                expectCharacterToken(tokens[1], 1, "[");
                expectCharacterToken(tokens[3], 3, "]");
            });
            testing_internal_1.it('should tokenize numbers', function () {
                var tokens = lex("88");
                testing_internal_1.expect(tokens.length).toEqual(1);
                expectNumberToken(tokens[0], 0, 88);
            });
            testing_internal_1.it('should tokenize numbers within index ops', function () { expectNumberToken(lex("a[22]")[2], 2, 22); });
            testing_internal_1.it('should tokenize simple quoted strings', function () { expectStringToken(lex('"a"')[0], 0, "a"); });
            testing_internal_1.it('should tokenize quoted strings with escaped quotes', function () { expectStringToken(lex('"a\\""')[0], 0, 'a"'); });
            testing_internal_1.it('should tokenize a string', function () {
                var tokens = lex("j-a.bc[22]+1.3|f:'a\\\'c':\"d\\\"e\"");
                expectIdentifierToken(tokens[0], 0, 'j');
                expectOperatorToken(tokens[1], 1, '-');
                expectIdentifierToken(tokens[2], 2, 'a');
                expectCharacterToken(tokens[3], 3, '.');
                expectIdentifierToken(tokens[4], 4, 'bc');
                expectCharacterToken(tokens[5], 6, '[');
                expectNumberToken(tokens[6], 7, 22);
                expectCharacterToken(tokens[7], 9, ']');
                expectOperatorToken(tokens[8], 10, '+');
                expectNumberToken(tokens[9], 11, 1.3);
                expectOperatorToken(tokens[10], 14, '|');
                expectIdentifierToken(tokens[11], 15, 'f');
                expectCharacterToken(tokens[12], 16, ':');
                expectStringToken(tokens[13], 17, "a'c");
                expectCharacterToken(tokens[14], 23, ':');
                expectStringToken(tokens[15], 24, 'd"e');
            });
            testing_internal_1.it('should tokenize undefined', function () {
                var tokens = lex("undefined");
                expectKeywordToken(tokens[0], 0, "undefined");
                testing_internal_1.expect(tokens[0].isKeywordUndefined()).toBe(true);
            });
            testing_internal_1.it('should ignore whitespace', function () {
                var tokens = lex("a \t \n \r b");
                expectIdentifierToken(tokens[0], 0, 'a');
                expectIdentifierToken(tokens[1], 8, 'b');
            });
            testing_internal_1.it('should tokenize quoted string', function () {
                var str = "['\\'', \"\\\"\"]";
                var tokens = lex(str);
                expectStringToken(tokens[1], 1, "'");
                expectStringToken(tokens[3], 7, '"');
            });
            testing_internal_1.it('should tokenize escaped quoted string', function () {
                var str = '"\\"\\n\\f\\r\\t\\v\\u00A0"';
                var tokens = lex(str);
                testing_internal_1.expect(tokens.length).toEqual(1);
                testing_internal_1.expect(tokens[0].toString()).toEqual('"\n\f\r\t\v\u00A0');
            });
            testing_internal_1.it('should tokenize unicode', function () {
                var tokens = lex('"\\u00A0"');
                testing_internal_1.expect(tokens.length).toEqual(1);
                testing_internal_1.expect(tokens[0].toString()).toEqual('\u00a0');
            });
            testing_internal_1.it('should tokenize relation', function () {
                var tokens = lex("! == != < > <= >= === !==");
                expectOperatorToken(tokens[0], 0, '!');
                expectOperatorToken(tokens[1], 2, '==');
                expectOperatorToken(tokens[2], 5, '!=');
                expectOperatorToken(tokens[3], 8, '<');
                expectOperatorToken(tokens[4], 10, '>');
                expectOperatorToken(tokens[5], 12, '<=');
                expectOperatorToken(tokens[6], 15, '>=');
                expectOperatorToken(tokens[7], 18, '===');
                expectOperatorToken(tokens[8], 22, '!==');
            });
            testing_internal_1.it('should tokenize statements', function () {
                var tokens = lex("a;b;");
                expectIdentifierToken(tokens[0], 0, 'a');
                expectCharacterToken(tokens[1], 1, ';');
                expectIdentifierToken(tokens[2], 2, 'b');
                expectCharacterToken(tokens[3], 3, ';');
            });
            testing_internal_1.it('should tokenize function invocation', function () {
                var tokens = lex("a()");
                expectIdentifierToken(tokens[0], 0, 'a');
                expectCharacterToken(tokens[1], 1, '(');
                expectCharacterToken(tokens[2], 2, ')');
            });
            testing_internal_1.it('should tokenize simple method invocations', function () {
                var tokens = lex("a.method()");
                expectIdentifierToken(tokens[2], 2, 'method');
            });
            testing_internal_1.it('should tokenize method invocation', function () {
                var tokens = lex("a.b.c (d) - e.f()");
                expectIdentifierToken(tokens[0], 0, 'a');
                expectCharacterToken(tokens[1], 1, '.');
                expectIdentifierToken(tokens[2], 2, 'b');
                expectCharacterToken(tokens[3], 3, '.');
                expectIdentifierToken(tokens[4], 4, 'c');
                expectCharacterToken(tokens[5], 6, '(');
                expectIdentifierToken(tokens[6], 7, 'd');
                expectCharacterToken(tokens[7], 8, ')');
                expectOperatorToken(tokens[8], 10, '-');
                expectIdentifierToken(tokens[9], 12, 'e');
                expectCharacterToken(tokens[10], 13, '.');
                expectIdentifierToken(tokens[11], 14, 'f');
                expectCharacterToken(tokens[12], 15, '(');
                expectCharacterToken(tokens[13], 16, ')');
            });
            testing_internal_1.it('should tokenize number', function () {
                var tokens = lex("0.5");
                expectNumberToken(tokens[0], 0, 0.5);
            });
            // NOTE(deboer): NOT A LEXER TEST
            //    it('should tokenize negative number', () => {
            //      var tokens:Token[] = lex("-0.5");
            //      expectNumberToken(tokens[0], 0, -0.5);
            //    });
            testing_internal_1.it('should tokenize number with exponent', function () {
                var tokens = lex("0.5E-10");
                testing_internal_1.expect(tokens.length).toEqual(1);
                expectNumberToken(tokens[0], 0, 0.5E-10);
                tokens = lex("0.5E+10");
                expectNumberToken(tokens[0], 0, 0.5E+10);
            });
            testing_internal_1.it('should throws exception for invalid exponent', function () {
                testing_internal_1.expect(function () { lex("0.5E-"); })
                    .toThrowError('Lexer Error: Invalid exponent at column 4 in expression [0.5E-]');
                testing_internal_1.expect(function () { lex("0.5E-A"); })
                    .toThrowError('Lexer Error: Invalid exponent at column 4 in expression [0.5E-A]');
            });
            testing_internal_1.it('should tokenize number starting with a dot', function () {
                var tokens = lex(".5");
                expectNumberToken(tokens[0], 0, 0.5);
            });
            testing_internal_1.it('should throw error on invalid unicode', function () {
                testing_internal_1.expect(function () { lex("'\\u1''bla'"); })
                    .toThrowError("Lexer Error: Invalid unicode escape [\\u1''b] at column 2 in expression ['\\u1''bla']");
            });
            testing_internal_1.it('should tokenize hash as operator', function () {
                var tokens = lex("#");
                expectOperatorToken(tokens[0], 0, '#');
            });
            testing_internal_1.it('should tokenize ?. as operator', function () {
                var tokens = lex('?.');
                expectOperatorToken(tokens[0], 0, '?.');
            });
        });
    });
}
exports.main = main;
//# sourceMappingURL=lexer_spec.js.map
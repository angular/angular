import {describe, it, expect} from 'test_lib/test_lib';
import {Lexer, Scanner, Token} from 'change_detection/parser/lexer';
import {DOM} from 'facade/dom';
import {List, ListWrapper} from "facade/collection";
import {StringWrapper} from "facade/lang";

function expectToken(token, index) {
  expect(token instanceof Token).toBe(true);
  expect(token.index).toEqual(index);
}

function expectCharacterToken(token, index, character) {
  expect(character.length).toBe(1);
  expectToken(token, index);
  expect(token.isCharacter(StringWrapper.charCodeAt(character, 0))).toBe(true);
}

function expectOperatorToken(token, index, operator) {
  expectToken(token, index);
  expect(token.isOperator(operator)).toBe(true);
}

function expectNumberToken(token, index, n) {
  expectToken(token, index);
  expect(token.isNumber()).toBe(true);
  expect(token.toNumber()).toBe(n);
}

function expectStringToken(token, index, str) {
  expectToken(token, index);
  expect(token.isString()).toBe(true);
  expect(token.toString()).toBe(str);
}

function expectIdentifierToken(token, index, identifier) {
  expectToken(token, index);
  expect(token.isIdentifier()).toBe(true);
  expect(token.toString()).toEqual(identifier);
}

function expectKeywordToken(token, index, keyword) {
  expectToken(token, index);
  expect(token.isKeyword()).toBe(true);
  expect(token.toString()).toEqual(keyword);
}


export function main() {
  describe('lexer', function() {
    describe('token', function() {
      it('should tokenize a simple identifier', function() {
        var tokens:List<int> = Lexer("j");
        expect(tokens.length).toEqual(1);
        expectIdentifierToken(tokens[0], 0, 'j');
      });

      it('should tokenize a dotted identifier', function() {
        var tokens:List<int> = Lexer("j.k");
        expect(tokens.length).toEqual(3);
        expectIdentifierToken(tokens[0], 0, 'j');
        expectCharacterToken (tokens[1], 1, '.');
        expectIdentifierToken(tokens[2], 2, 'k');
      });

      it('should tokenize an operator', function() {
        var tokens:List<int> = Lexer("j-k");
        expect(tokens.length).toEqual(3);
        expectOperatorToken(tokens[1], 1, '-');
      });

      it('should tokenize an indexed operator', function() {
        var tokens:List<int> = Lexer("j[k]");
        expect(tokens.length).toEqual(4);
        expectCharacterToken(tokens[1], 1, "[");
        expectCharacterToken(tokens[3], 3, "]");
      });

      it('should tokenize numbers', function() {
        var tokens:List<int> = Lexer("88");
        expect(tokens.length).toEqual(1);
        expectNumberToken(tokens[0], 0, 88);
      });

      it('should tokenize numbers within index ops', function() {
        expectNumberToken(Lexer("a[22]")[2], 2, 22);
      });

      it('should tokenize simple quoted strings', function() {
        expectStringToken(Lexer('"a"')[0], 0, "a");
      });

      it('should tokenize quoted strings with escaped quotes', function() {
        expectStringToken(Lexer('"a\\""')[0], 0, 'a"');
      });

    });
  });
}

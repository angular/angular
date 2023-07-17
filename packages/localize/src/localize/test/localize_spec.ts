/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {$localize, TranslateFn} from '../src/localize';

describe('$localize tag', () => {
  describe('with no `translate()` defined (the default)', () => {
    it('should render template literals as-is', () => {
      expect($localize.translate).toBeUndefined();
      expect($localize`abc`).toEqual('abc');
      expect($localize`abc${1 + 2 + 3}`).toEqual('abc6');
      expect($localize`abc${1 + 2 + 3}def`).toEqual('abc6def');
      expect($localize`abc${1 + 2 + 3}def${4 + 5 + 6}`).toEqual('abc6def15');
      const getName = () => 'World';
      expect($localize`Hello, ${getName()}!`).toEqual('Hello, World!');
    });

    it('should strip metadata block from message parts', () => {
      expect($localize.translate).toBeUndefined();
      expect($localize`:meaning|description@@custom-id:abcdef`).toEqual('abcdef');
    });

    it('should ignore escaped metadata block marker', () => {
      expect($localize.translate).toBeUndefined();
      expect($localize`\:abc:def`).toEqual(':abc:def');
    });

    it('should strip metadata block containing escaped block markers', () => {
      expect($localize.translate).toBeUndefined();
      expect($localize`:abc\:def:content`).toEqual('content');
    });

    it('should strip placeholder names from message parts', () => {
      expect($localize.translate).toBeUndefined();
      expect($localize`abc${1 + 2 + 3}:ph1:def${4 + 5 + 6}:ph2:`).toEqual('abc6def15');
    });

    it('should ignore escaped placeholder name marker', () => {
      expect($localize.translate).toBeUndefined();
      expect($localize`abc${1 + 2 + 3}\:ph1:def${4 + 5 + 6}\:ph2:`).toEqual('abc6:ph1:def15:ph2:');
    });
  });

  describe('with `translate()` defined as an identity', () => {
    beforeEach(() => {
      $localize.translate = identityTranslate;
    });
    afterEach(() => {
      $localize.translate = undefined;
    });

    it('should render template literals as-is', () => {
      expect($localize`abc`).toEqual('abc');
      expect($localize`abc${1 + 2 + 3}`).toEqual('abc6');
      expect($localize`abc${1 + 2 + 3}def`).toEqual('abc6def');
      expect($localize`abc${1 + 2 + 3}def${4 + 5 + 6}`).toEqual('abc6def15');
      const getName = () => 'World';
      expect($localize`Hello, ${getName()}!`).toEqual('Hello, World!');
    });
  });

  describe('with `translate()` defined to upper-case messageParts', () => {
    beforeEach(() => {
      $localize.translate = upperCaseTranslate;
    });
    afterEach(() => {
      $localize.translate = undefined;
    });

    it('should render template literals with messages upper-cased', () => {
      expect($localize`abc`).toEqual('ABC');
      expect($localize`abc${1 + 2 + 3}`).toEqual('ABC6');
      expect($localize`abc${1 + 2 + 3}def`).toEqual('ABC6DEF');
      expect($localize`abc${1 + 2 + 3}def${4 + 5 + 6}`).toEqual('ABC6DEF15');
      const getName = () => 'World';
      expect($localize`Hello, ${getName()}!`).toEqual('HELLO, World!');
    });
  });

  describe('with `translate()` defined to reverse expressions', () => {
    beforeEach(() => {
      $localize.translate = reverseTranslate;
    });
    afterEach(() => {
      $localize.translate = undefined;
    });

    it('should render template literals with expressions reversed', () => {
      const getName = () => 'World';
      expect($localize`abc${1 + 2 + 3}def${4 + 5 + 6} - Hello, ${getName()}!`)
          .toEqual('abcWorlddef15 - Hello, 6!');
    });
  });
});

function makeTemplateObject(cooked: string[], raw: string[]): TemplateStringsArray {
  Object.defineProperty(cooked, 'raw', {value: raw});
  return cooked as any;
}

const identityTranslate: TranslateFn = function(
    messageParts: TemplateStringsArray, expressions: readonly any[]) {
  return [messageParts, expressions];
};

const upperCaseTranslate: TranslateFn = function(
    messageParts: TemplateStringsArray, expressions: readonly any[]) {
  return [
    makeTemplateObject(
        Array.from(messageParts).map((part: string) => part.toUpperCase()),
        messageParts.raw.map((part: string) => part.toUpperCase())),
    expressions
  ];
};

const reverseTranslate: TranslateFn = function(
    messageParts: TemplateStringsArray, expressions: readonly any[]) {
  expressions = Array.from(expressions).reverse();
  return [messageParts, expressions];
};

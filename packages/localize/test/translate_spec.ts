/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import '@angular/localize/init';
import {clearTranslations, loadTranslations} from '../src/translate';

describe('$localize tag with translations', () => {
  describe('identities', () => {
    beforeEach(() => {
      loadTranslations({
        'abc': 'abc',
        'abc{$ph_1}': 'abc{$ph_1}',
        'abc{$ph_1}def': 'abc{$ph_1}def',
        'abc{$ph_1}def{$ph_2}': 'abc{$ph_1}def{$ph_2}',
        'Hello, {$ph_1}!': 'Hello, {$ph_1}!',
      });
    });
    afterEach(() => { clearTranslations(); });

    it('should render template literals as-is', () => {
      expect($localize `abc`).toEqual('abc');
      expect($localize `abc${1 + 2 + 3}`).toEqual('abc6');
      expect($localize `abc${1 + 2 + 3}def`).toEqual('abc6def');
      expect($localize `abc${1 + 2 + 3}def${4 + 5 + 6}`).toEqual('abc6def15');
      const getName = () => 'World';
      expect($localize `Hello, ${getName()}!`).toEqual('Hello, World!');
    });
  });

  describe('to upper-case messageParts', () => {
    beforeEach(() => {
      loadTranslations({
        'abc': 'ABC',
        'abc{$ph_1}': 'ABC{$ph_1}',
        'abc{$ph_1}def': 'ABC{$ph_1}DEF',
        'abc{$ph_1}def{$ph_2}': 'ABC{$ph_1}DEF{$ph_2}',
        'Hello, {$ph_1}!': 'HELLO, {$ph_1}!',
      });
    });
    afterEach(() => { clearTranslations(); });

    it('should render template literals with messages upper-cased', () => {
      expect($localize `abc`).toEqual('ABC');
      expect($localize `abc${1 + 2 + 3}`).toEqual('ABC6');
      expect($localize `abc${1 + 2 + 3}def`).toEqual('ABC6DEF');
      expect($localize `abc${1 + 2 + 3}def${4 + 5 + 6}`).toEqual('ABC6DEF15');
      const getName = () => 'World';
      expect($localize `Hello, ${getName()}!`).toEqual('HELLO, World!');
    });
  });

  describe('to reverse expressions', () => {
    beforeEach(() => {
      loadTranslations({
        'abc{$ph_1}def{$ph_2} - Hello, {$ph_3}!': 'abc{$ph_3}def{$ph_2} - Hello, {$ph_1}!',
      });
    });
    afterEach(() => { clearTranslations(); });

    it('should render template literals with expressions reversed', () => {
      const getName = () => 'World';
      expect($localize `abc${1 + 2 + 3}def${4 + 5 + 6} - Hello, ${getName()}!`)
          .toEqual('abcWorlddef15 - Hello, 6!');
    });
  });

  describe('to remove expressions', () => {
    beforeEach(() => {
      loadTranslations({
        'abc{$ph_1}def{$ph_2} - Hello, {$ph_3}!': 'abc{$ph_1} - Hello, {$ph_3}!',
      });
    });
    afterEach(() => { clearTranslations(); });

    it('should render template literals with expressions removed', () => {
      const getName = () => 'World';
      expect($localize `abc${1 + 2 + 3}def${4 + 5 + 6} - Hello, ${getName()}!`)
          .toEqual('abc6 - Hello, World!');
    });
  });
});

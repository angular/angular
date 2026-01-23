/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
// Ensure that `$localize` is loaded to the global scope.
import '../init';

import {clearTranslations, loadTranslations} from '../index';
import {computeMsgId, MessageId, TargetMessage} from '../src/utils';

describe('$localize tag with translations', () => {
  describe('identities', () => {
    beforeEach(() => {
      loadTranslations(
        computeIds({
          'abc': 'abc',
          'abc{$PH}': 'abc{$PH}',
          'abc{$PH}def': 'abc{$PH}def',
          'abc{$PH}def{$PH_1}': 'abc{$PH}def{$PH_1}',
          'Hello, {$PH}!': 'Hello, {$PH}!',
        }),
      );
    });
    afterEach(() => {
      clearTranslations();
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

  describe('to upper-case messageParts', () => {
    beforeEach(() => {
      loadTranslations(
        computeIds({
          'abc': 'ABC',
          'abc{$PH}': 'ABC{$PH}',
          'abc{$PH}def': 'ABC{$PH}DEF',
          'abc{$PH}def{$PH_1}': 'ABC{$PH}DEF{$PH_1}',
          'Hello, {$PH}!': 'HELLO, {$PH}!',
        }),
      );
    });
    afterEach(() => {
      clearTranslations();
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

  describe('to reverse expressions', () => {
    beforeEach(() => {
      loadTranslations(
        computeIds({
          'abc{$PH}def{$PH_1} - Hello, {$PH_2}!': 'abc{$PH_2}def{$PH_1} - Hello, {$PH}!',
        }),
      );
    });
    afterEach(() => {
      clearTranslations();
    });

    it('should render template literals with expressions reversed', () => {
      const getName = () => 'World';
      expect($localize`abc${1 + 2 + 3}def${4 + 5 + 6} - Hello, ${getName()}!`).toEqual(
        'abcWorlddef15 - Hello, 6!',
      );
    });
  });

  describe('to remove expressions', () => {
    beforeEach(() => {
      loadTranslations(
        computeIds({
          'abc{$PH}def{$PH_1} - Hello, {$PH_2}!': 'abc{$PH} - Hello, {$PH_2}!',
        }),
      );
    });
    afterEach(() => {
      clearTranslations();
    });

    it('should render template literals with expressions removed', () => {
      const getName = () => 'World';
      expect($localize`abc${1 + 2 + 3}def${4 + 5 + 6} - Hello, ${getName()}!`).toEqual(
        'abc6 - Hello, World!',
      );
    });
  });
});

function computeIds(
  translations: Record<MessageId, TargetMessage>,
): Record<MessageId, TargetMessage> {
  const processed: Record<MessageId, TargetMessage> = {};
  Object.keys(translations).forEach(
    (key) => (processed[computeMsgId(key, '')] = translations[key]),
  );
  return processed;
}

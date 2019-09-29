/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ParsedMessage} from '../../../src/utils';


/**
 * This helper is used to create `ParsedMessage` objects to be rendered in the
 * `TranslationSerializer` tests.
 */
export function mockMessage(
    messageId: string, messageParts: string[], placeholderNames: string[], meaning = '',
    description = ''): ParsedMessage {
  let messageString = messageParts[0];
  for (let i = 1; i < messageParts.length; i++) {
    messageString += `{$${placeholderNames[i-1]}}${messageParts[i]}`;
  }
  return {
    messageId,
    messageString,
    messageParts,
    placeholderNames,
    description,
    meaning,
    substitutions: []
  };
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ɵParsedMessage} from '@angular/localize';
import {SourceLocation} from '@angular/localize/src/utils';

export interface MockMessageOptions {
  customId?: string;
  meaning?: string;
  description?: string;
  location?: SourceLocation;
  legacyIds?: string[];
}

/**
 * This helper is used to create `ParsedMessage` objects to be rendered in the
 * `TranslationSerializer` tests.
 */
export function mockMessage(
    id: string, messageParts: string[], placeholderNames: string[],
    {customId, meaning = '', description = '', location, legacyIds = []}: MockMessageOptions):
    ɵParsedMessage {
  let text = messageParts[0];
  for (let i = 1; i < messageParts.length; i++) {
    text += `{$${placeholderNames[i - 1]}}${messageParts[i]}`;
  }
  return {
    id: customId || id,  // customId trumps id
    text,
    messageParts,
    placeholderNames,
    customId,
    description,
    meaning,
    substitutions: [],
    legacyIds,
    location,
  };
}

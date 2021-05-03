/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {absoluteFrom} from '@angular/compiler-cli/src/ngtsc/file_system';
import {ɵParsedMessage} from '@angular/localize';
import {MessageId, SourceLocation} from '@angular/localize/src/utils';

export interface MockMessageOptions {
  customId?: string;
  meaning?: string;
  description?: string;
  location?: SourceLocation;
  legacyIds?: string[];
  messagePartLocations?: (SourceLocation|undefined)[];
  substitutionLocations?: Record<string, SourceLocation|undefined>;
}

/**
 * This helper is used to create `ParsedMessage` objects to be rendered in the
 * `TranslationSerializer` tests.
 */
export function mockMessage(
    id: MessageId, messageParts: string[], placeholderNames: string[],
    options: MockMessageOptions): ɵParsedMessage {
  let text = messageParts[0];
  for (let i = 1; i < messageParts.length; i++) {
    text += `{$${placeholderNames[i - 1]}}${messageParts[i]}`;
  }
  return {
    substitutions: [],
    ...options,
    id: options.customId || id,  // customId trumps id
    text,
    messageParts,
    placeholderNames,
  };
}

export function location(
    file: string, startLine: number, startCol: number, endLine: number,
    endCol: number): SourceLocation {
  return {
    file: absoluteFrom(file),
    start: {line: startLine, column: startCol},
    end: {line: endLine, column: endCol}
  };
}

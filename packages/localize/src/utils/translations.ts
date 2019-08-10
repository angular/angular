/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {PLACEHOLDER_NAME_MARKER} from './constants';
import {SourceMessage, parseMessage} from './messages';

/**
 * A key used to lookup a `TargetMessage` in a hash map.
 */
export type TranslationKey = SourceMessage;

/**
 * A string containing a translation target message.
 *
 * I.E. the message that indicates what will be translated to.
 *
 * Uses `{$placeholder-name}` to indicate a placeholder.
 */
export type TargetMessage = string;

/**
 * A translation message that has been processed to extract the message parts and placeholders.
 */
export interface ParsedTranslation {
  messageParts: TemplateStringsArray;
  placeholderNames: string[];
}

/**
 * The internal structure used by the runtime localization to translate messages.
 */
export type ParsedTranslations = Record<TranslationKey, ParsedTranslation>;


/**
 * Translate the text of the `$localize` tagged-string (i.e. `messageParts` and
 * `substitutions`) using the given `translations`.
 *
 * The tagged-string is parsed to extract its `translationKey` which is used to find an appropriate
 * `ParsedTranslation`.
 *
 * If one is found then it is used to translate the message into a new set of `messageParts` and
 * `substitutions`.
 * The translation may reorder (or remove) substitutions as appropriate.
 *
 * If no translation matches then the original `messageParts` and `substitutions` are returned
 */
export function translate(
    translations: Record<string, ParsedTranslation>, messageParts: TemplateStringsArray,
    substitutions: readonly any[]): [TemplateStringsArray, readonly any[]] {
  const message = parseMessage(messageParts, substitutions);
  const translation = translations[message.translationKey];
  if (translation !== undefined) {
    return [
      translation.messageParts,
      translation.placeholderNames.map(placeholder => message.substitutions[placeholder])
    ];
  } else {
    return [messageParts, substitutions];
  }
}

/**
 * Parse the `messageParts` and `placeholderNames` out of a target `message`.
 *
 * Used by `loadTranslations()` to convert target message strings into a structure that is more
 * appropriate for doing translation.
 *
 * @param message the message to be parsed.
 */
export function parseTranslation(message: TargetMessage): ParsedTranslation {
  const parts = message.split(/{\$([^}]*)}/);
  const messageParts = [parts[0]];
  const placeholderNames: string[] = [];
  for (let i = 1; i < parts.length - 1; i += 2) {
    placeholderNames.push(parts[i]);
    messageParts.push(`${parts[i + 1]}`);
  }
  const rawMessageParts =
      messageParts.map(part => part.charAt(0) === PLACEHOLDER_NAME_MARKER ? '\\' + part : part);
  return {messageParts: makeTemplateObject(messageParts, rawMessageParts), placeholderNames};
}

/**
 * Create the specialized array that is passed to tagged-string tag functions.
 *
 * @param cooked The message parts with their escape codes processed.
 * @param raw The message parts with their escaped codes as-is.
 */
export function makeTemplateObject(cooked: string[], raw: string[]): TemplateStringsArray {
  Object.defineProperty(cooked, 'raw', {value: raw});
  return cooked as any;
}

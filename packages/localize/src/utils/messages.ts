/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {computeMsgId} from '@angular/compiler';
import {BLOCK_MARKER, ID_SEPARATOR, MEANING_SEPARATOR} from './constants';

/**
 * Re-export this helper function so that users of `@angular/localize` don't need to actively import
 * from `@angular/compiler`.
 */
export {computeMsgId} from '@angular/compiler';

/**
 * A string containing a translation source message.
 *
 * I.E. the message that indicates what will be translated from.
 *
 * Uses `{$placeholder-name}` to indicate a placeholder.
 */
export type SourceMessage = string;

/**
 * A string containing a translation target message.
 *
 * I.E. the message that indicates what will be translated to.
 *
 * Uses `{$placeholder-name}` to indicate a placeholder.
 */
export type TargetMessage = string;

/**
 * A string that uniquely identifies a message, to be used for matching translations.
 */
export type MessageId = string;

/**
 * Information parsed from a `$localize` tagged string that is used to translate it.
 *
 * For example:
 *
 * ```
 * const name = 'Jo Bloggs';
 * $localize`Hello ${name}:title!`;
 * ```
 *
 * May be parsed into:
 *
 * ```
 * {
 *   messageId: '6998194507597730591',
 *   substitutions: { title: 'Jo Bloggs' },
 * }
 * ```
 */
export interface ParsedMessage {
  /**
   * The key used to look up the appropriate translation target.
   */
  messageId: MessageId;
  /**
   * A mapping of placeholder names to substitution values.
   */
  substitutions: Record<string, any>;
  /**
   * A human readable rendering of the message
   */
  messageString: string;
}

/**
 * Parse a `$localize` tagged string into a structure that can be used for translation.
 *
 * See `ParsedMessage` for an example.
 */
export function parseMessage(
    messageParts: TemplateStringsArray, expressions?: readonly any[]): ParsedMessage {
  const substitutions: {[placeholderName: string]: any} = {};
  const metadata = parseMetadata(messageParts[0], messageParts.raw[0]);
  let messageString = metadata.text;
  for (let i = 1; i < messageParts.length; i++) {
    const {text: messagePart, block: placeholderName = computePlaceholderName(i)} =
        splitBlock(messageParts[i], messageParts.raw[i]);
    messageString += `{$${placeholderName}}${messagePart}`;
    if (expressions !== undefined) {
      substitutions[placeholderName] = expressions[i - 1];
    }
  }
  return {
    messageId: metadata.id || computeMsgId(messageString, metadata.meaning || ''),
    substitutions,
    messageString,
  };
}

export interface MessageMetadata {
  text: string;
  meaning: string|undefined;
  description: string|undefined;
  id: string|undefined;
}

/**
 * Parse the given message part (`cooked` + `raw`) to extract the message metadata from the text.
 *
 * If the message part has a metadata block this function will extract the `meaning`,
 * `description` and `id` (if provided) from the block. These metadata properties are serialized in
 * the string delimited by `|` and `@@` respectively.
 *
 * For example:
 *
 * ```ts
 * `:meaning|description@@id`
 * `:meaning|@@id`
 * `:meaning|description`
 * `description@@id`
 * `meaning|`
 * `description`
 * `@@id`
 * ```
 *
 * @param cooked The cooked version of the message part to parse.
 * @param raw The raw version of the message part to parse.
 * @returns A object containing any metadata that was parsed from the message part.
 */
export function parseMetadata(cooked: string, raw: string): MessageMetadata {
  const {text, block} = splitBlock(cooked, raw);
  if (block === undefined) {
    return {text, meaning: undefined, description: undefined, id: undefined};
  } else {
    const [meaningAndDesc, id] = block.split(ID_SEPARATOR, 2);
    let [meaning, description]: (string | undefined)[] = meaningAndDesc.split(MEANING_SEPARATOR, 2);
    if (description === undefined) {
      description = meaning;
      meaning = undefined;
    }
    if (description === '') {
      description = undefined;
    }
    return {text, meaning, description, id};
  }
}

/**
 * Split a message part (`cooked` + `raw`) into an optional delimited "block" off the front and the
 * rest of the text of the message part.
 *
 * Blocks appear at the start of message parts. They are delimited by a colon `:` character at the
 * start and end of the block.
 *
 * If the block is in the first message part then it will be metadata about the whole message:
 * meaning, description, id.  Otherwise it will be metadata about the immediately preceding
 * substitution: placeholder name.
 *
 * Since blocks are optional, it is possible that the content of a message block actually starts
 * with a block marker. In this case the marker must be escaped `\:`.
 *
 * @param cooked The cooked version of the message part to parse.
 * @param raw The raw version of the message part to parse.
 * @returns An object containing the `text` of the message part and the text of the `block`, if it
 * exists.
 */
export function splitBlock(cooked: string, raw: string): {text: string, block?: string} {
  // Synthesizing AST nodes that represent template literals using the TypeScript API is problematic
  // because it doesn't allow for the raw value of messageParts to be programmatically set.
  // The result is that synthesized AST nodes have empty `raw` values.

  // Normally we rely upon checking the `raw` value to check whether the `BLOCK_MARKER` was escaped
  // in the original source. If the `raw` value is missing then we cannot do this.
  // In such a case we fall back on the `cooked` version and assume that the `BLOCK_MARKER` was not
  // escaped.

  // This should be OK because synthesized nodes only come from the Angular template compiler, which
  // always provides full id and placeholder name information so it will never escape `BLOCK_MARKER`
  // characters.
  if ((raw || cooked).charAt(0) !== BLOCK_MARKER) {
    return {text: cooked};
  } else {
    const endOfBlock = cooked.indexOf(BLOCK_MARKER, 1);
    return {
      block: cooked.substring(1, endOfBlock),
      text: cooked.substring(endOfBlock + 1),
    };
  }
}

function computePlaceholderName(index: number) {
  return index === 1 ? 'PH' : `PH_${index - 1}`;
}

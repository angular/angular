/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as i18n from '../i18n_ast';

export abstract class Serializer {
  // - The `placeholders` and `placeholderToMessage` properties are irrelevant in the input messages
  // - The `id` contains the message id that the serializer is expected to use
  // - Placeholder names are already map to public names using the provided mapper
  abstract write(messages: i18n.Message[]): string;

  abstract load(content: string, url: string): {[msgId: string]: i18n.Node[]};

  abstract digest(message: i18n.Message): string;

  // Creates a name mapper, see `PlaceholderMapper`
  // Returning `null` means that no name mapping is used.
  createNameMapper(message: i18n.Message): PlaceholderMapper { return null; }
}

/**
 * A `PlaceholderMapper` converts placeholder names from internal to serialized representation and
 * back.
 *
 * It should be used for serialization format that put constraints on the placeholder names.
 */
export interface PlaceholderMapper {
  toPublicName(internalName: string): string;

  toInternalName(publicName: string): string;
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Element, ParseError} from '@angular/compiler';
import {ɵParsedTranslation} from '@angular/localize';

import {MessageSerializer} from '../message_serialization/message_serializer';

import {parseInnerRange} from './translation_utils';

/**
 * Serialize the given `element` into a parsed translation using the given `serializer`.
 */
export function serializeTranslationMessage(
    element: Element, serializer: MessageSerializer<ɵParsedTranslation>):
    {translation: ɵParsedTranslation|null, errors: ParseError[]} {
  const {rootNodes, errors} = parseInnerRange(element);
  let translation: ɵParsedTranslation|null = null;
  try {
    translation = serializer.serialize(rootNodes);
  } catch (e) {
    errors.push(e);
  }
  return {translation, errors};
}

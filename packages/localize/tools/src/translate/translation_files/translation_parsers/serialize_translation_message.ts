/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Element, ParseError} from '@angular/compiler';
import {ɵParsedTranslation} from '@angular/localize';

import {MessageSerializer, MessageSerializerConfig} from '../message_serialization/message_serializer';
import {TargetMessageRenderer} from '../message_serialization/target_message_renderer';

import {parseInnerRange} from './translation_utils';

/**
 * Serialize the given `element` into a parsed translation using the given `serializer`.
 */
export function serializeTranslationMessage(element: Element, config: MessageSerializerConfig): {
  translation: ɵParsedTranslation|null,
  parseErrors: ParseError[],
  serializeErrors: ParseError[]
} {
  const {rootNodes, errors: parseErrors} = parseInnerRange(element);
  try {
    const serializer = new MessageSerializer(new TargetMessageRenderer(), config);
    const translation = serializer.serialize(rootNodes);
    return {translation, parseErrors, serializeErrors: []};
  } catch (e) {
    return {translation: null, parseErrors, serializeErrors: [e as ParseError]};
  }
}

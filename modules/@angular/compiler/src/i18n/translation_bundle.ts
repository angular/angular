/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as html from '../ml_parser/ast';

import {MessageBundle} from './message_bundle';
import {Serializer} from './serializers/serializer';

/**
 * A container for translated messages
 */
export class TranslationBundle {
  constructor(private _messageMap: {[id: string]: html.Node[]} = {}) {}

  static load(content: string, url: string, messageBundle: MessageBundle, serializer: Serializer):
      TranslationBundle {
    return new TranslationBundle(serializer.load(content, url, messageBundle));
  }

  get(id: string): html.Node[] { return this._messageMap[id]; }

  has(id: string): boolean { return id in this._messageMap; }
}
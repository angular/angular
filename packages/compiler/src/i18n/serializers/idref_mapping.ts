/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as i18n from '../i18n_ast';

import {Serializer} from './serializer';

/**
 * Generates an id to reference mapping (JSON format).
 *
 * References are defined using the i18n attributes: `<p i18n="meaning|desc@@id##ref">content</p>`
 *
 * References are a way to reference a message. Unlike the message id, the references do not change
 * when the message content changes.
 */
export class IdToRefMapping extends Serializer {
  constructor(private serializer: Serializer) { super(); };

  write(messages: i18n.Message[], locale: string|null): string {
    const mapping: {[id: string]: string} = {};
    messages.forEach(msg => {
      if (msg.ref) {
        mapping[this.digest(msg)] = msg.ref;
      }
    });

    return JSON.stringify(mapping, null, 2);
  }

  load(content: string, url: string):
      {locale: string | null, i18nNodesByMsgId: {[msgId: string]: i18n.Node[]}} {
    throw new Error('Unsupported');
  }

  digest(message: i18n.Message): string { return this.serializer.digest(message); }
}
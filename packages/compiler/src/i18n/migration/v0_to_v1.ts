/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


import {I18nVersion} from '@angular/core';

import {Message} from '../i18n_ast';
import {MessageSpan} from '../i18n_ast';
import {MessageBundle} from '../message_bundle';
import {createSerializer} from '../serializers/factory';

export type V1ToV0Map = {
  [v1: string]: {ids: string[], sources?: MessageSpan[]}
};

/**
 * A single V1 message could replace multiple V0 messages.
 *
 * The generated mapping has the following keys for each message (indexed by v1 id):
 * - `ids`: the list of v0 ids that the v1 id replaces.
 * - `sources`: the list of `MessageSpan` for the v1 id.
 */
export function generateV1ToV0Map(messageBundle: MessageBundle, formatName: string): V1ToV0Map {
  const serializerV0 = createSerializer(formatName, I18nVersion.V0);
  const serializerV1 = createSerializer(formatName, I18nVersion.V1);

  const v1ToV0: V1ToV0Map = {};

  messageBundle.getMessages().forEach((msg: Message) => {
    const v0 = serializerV0.digest(msg);
    const v1 = serializerV1.digest(msg);

    if (v1ToV0.hasOwnProperty(v1)) {
      if (v1ToV0[v1].ids.indexOf(v0) === -1) {
        v1ToV0[v1].ids.push(v0);
        v1ToV0[v1].sources !.push(...msg.sources);
      }
    } else {
      v1ToV0[v1] = {
        ids: [v0],
        sources: msg.sources,
      };
    }
  });

  return v1ToV0;
}
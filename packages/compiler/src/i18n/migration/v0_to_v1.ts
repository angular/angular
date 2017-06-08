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
import {getXliffMsgTextById} from '../serializers/xliff';
import {getXliff2MsgTextById} from '../serializers/xliff2';
import {getXtbMsgTextById} from '../serializers/xtb';

export type V1ToV0Map = {
  [v1: string]: {ids: string[], sources?: MessageSpan[]}
};
export type V1ToV0Conflicts = {
  [v1: string]: {id: string, msg: string}[]
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

/**
 * A conflict occurs when not all of the V0 messages replaced by a single V1 message have the exact
 * same translation.
 *
 * Such conflicts need to be resolved before we can migrate the translations.
 *
 * The output a this function has an entry only for v1 message that conflict:
 * - `id` is the v0 message id
 * - `msg` is the content of the v0 message
 */
export function computeConflicts(map: V1ToV0Map, content: string, format: string): V1ToV0Conflicts {
  const candidates: {[v1: string]: string[]} = {};

  // Candidates are v1 messages that replace multiple v0 messages
  Object.keys(map).forEach(v1 => {
    if (map[v1].ids.length > 1) {
      candidates[v1] = map[v1].ids;
    }
  });

  const conflicts: V1ToV0Conflicts = {};

  let msgById: {[v0: string]: string};

  switch (format) {
    case 'xtb':
      msgById = getXtbMsgTextById(content, '');
      break;
    case 'xlf':
    case 'xliff':
      msgById = getXliffMsgTextById(content, '');
      break;
    case 'xlf2':
    case 'xliff2':
      msgById = getXliff2MsgTextById(content, '');
      break;
    default:
      throw Error(`Unsupported format "${format}"`);
  }

  // There is a conflict when not all of the v0 translations are the same for a given v1 message
  Object.keys(candidates).forEach((v1) => {
    const seenMsgs: string[] = [];
    const uniques: {id: string, msg: string}[] = [];
    candidates[v1].forEach((v0) => {
      if (msgById.hasOwnProperty(v0)) {
        const msg = msgById[v0];
        if (seenMsgs.indexOf(msg) === -1) {
          seenMsgs.push(msg);
          uniques.push({id: v0, msg});
        }
      }
    });
    if (uniques.length > 1) {
      conflicts[v1] = uniques;
    }
  });

  return conflicts;
}
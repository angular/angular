/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


import {I18nVersion} from '@angular/core';

import * as ml from '../../ml_parser/ast';
import {XmlParser} from '../../ml_parser/xml_parser';
import {Message, MessageSpan} from '../i18n_ast';
import {MessageBundle} from '../message_bundle';
import {I18nError} from '../parse_util';
import {createSerializer} from '../serializers/factory';
import {getXliffMsgTextById} from '../serializers/xliff';
import {getXliff2MsgTextById} from '../serializers/xliff2';
import {getXtbMsgTextById} from '../serializers/xtb';


// Maps v1 ids to corresponding v0 ids and their MessageSpan
export type V1ToV0Map = {
  [v1: string]: {ids: string[], sources?: MessageSpan[]}
};
// Map of v1 ids having conflicts
export type V1ToV0Conflicts = {
  [v1: string]: {id: string, msg: string}[]
};
// Map of v0 ids and their new v1 ids or `null`.
// `null` means that the ID is not used and should be removed
export type V0ToV1Map = {
  [v0: string]: string | null
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

/**
 * Auto conflict resolution: when a v1 message replaces several v0 messages we keep only the
 * first v0 message (arbitrary choice).
 */
export function resolveConflictsAuto(v1ToV0: V1ToV0Map): V0ToV1Map {
  const v0ToV1: V0ToV1Map = {};

  Object.keys(v1ToV0).forEach(v1 => {
    const v0Ids = v1ToV0[v1].ids;
    // Take the first value
    v0ToV1[v0Ids[0]] = v1;

    // Set other values to `null` to be removed
    for (let i = 1; i < v0Ids.length; i++) {
      v0ToV1[v1ToV0[v1].ids[i]] = null;
    }
  });

  return v0ToV1;
}


/**
 * Manual conflict resolution: the conflicts in `v1ToV0` are resolved by using the provided
 * `resolutions` that maps the new id to the one former id that should be used.
 */
export function resolveConflicts(
    v1ToV0: V1ToV0Map, resolutions: {[v1: string]: string}): V0ToV1Map {
  const v0ToV1: V0ToV1Map = {};

  Object.keys(v1ToV0).forEach(v1 => {
    const v0Ids = v1ToV0[v1].ids;

    if (v0Ids.length === 1) {
      v0ToV1[v0Ids[0]] = v1;
    } else {
      if (!resolutions.hasOwnProperty(v1)) {
        throw new Error(`Missing resolution for new id "${v1}"`);
      }

      v0Ids.forEach(v0 => { v0ToV1[v0] = v0 === resolutions[v1] ? v1 : null; });
    }
  });

  return v0ToV1;
}


/**
 * `v0ToV1` contains the mapping from the old id to the new id. If the mapping is `null` then the
 * old message should be removed.
 */
export function applyMapping(
    v0toV1: V0ToV1Map, v1toV0: V1ToV0Map, content: string, format: string) {
  // First step is to migrate the IDs and remove obsolete messages
  const {msgInfos, errors} = new MsgInfosVisitor().parse(content, '');

  if (errors.length) {
    throw new Error(`Translations parse errors:\n${errors.join('\n')}`);
  }

  // Process messages in reverse order because modifying a message invalidate the following
  // SourceSpan
  Array.from(msgInfos.entries()).reverse().forEach(([id, info]) => {
    if (v0toV1.hasOwnProperty(id)) {
      const newId = v0toV1[id];
      if (newId === null) {
        // Remove the whole element when the target id is null
        const startOfEl = info.el.sourceSpan.start.offset;
        const endOfPreviousEl = content.lastIndexOf('>', startOfEl);
        const removeFrom = endOfPreviousEl === -1 ? startOfEl : endOfPreviousEl + 1;
        const removeTo = info.el.endSourceSpan !.end.offset;
        content = content.slice(0, removeFrom) + content.slice(removeTo);
      } else {
        // Change the id attribute when there is a target id
        const removeFrom = info.id.valueSpan !.start.offset + 1;
        const removeTo = info.id.valueSpan !.end.offset - 1;
        content = content.slice(0, removeFrom) + newId + content.slice(removeTo);
      }
    }
  });


  // Second step is to replace the references to the source file

  // TODO(vicb)

  return content;
}

type MsgInfos = Map<string, {el: ml.Element, id: ml.Attribute}>;

/**
 * Parse a translation bundle and extract for each message:
 * - the `id` attribute node,
 * - the message element node.
 *
 * Supports: xtb, xliff and xliff2
 */
class MsgInfosVisitor extends ml.RecursiveVisitor {
  private errors: I18nError[];
  private msgInfos: MsgInfos = new Map();

  parse(content: string, url: string): {msgInfos: MsgInfos, errors: I18nError[]} {
    const xmlParser = new XmlParser().parse(content, url, false);
    this.errors = xmlParser.errors;
    ml.visitAll(this, xmlParser.rootNodes, null);
    return {msgInfos: this.msgInfos, errors: this.errors};
  }

  visitElement(el: ml.Element, context: any): any {
    switch (el.name) {
      case 'trans-unit':   // xliff
      case 'unit':         // xliff2
      case 'translation':  // xtb
        const id = el.attrs.find(attr => attr.name === 'id');
        if (id) {
          this.msgInfos.set(id.value, {el, id});
        } else {
          this._addError(el, `<${el.name}> misses the "id" attribute`);
        }
        break;

      default:
        super.visitElement(el, context);
    }
  }

  private _addError(node: ml.Node, message: string): void {
    this.errors.push(new I18nError(node.sourceSpan !, message));
  }
}

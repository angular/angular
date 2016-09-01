/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as html from '../../ml_parser/ast';
import * as i18n from '../i18n_ast';
import {MessageBundle} from '../message_bundle';

export interface Serializer {
  write(messageMap: {[id: string]: i18n.Message}): string;

  load(content: string, url: string, messageBundle: MessageBundle): {[id: string]: html.Node[]};
}

// Generate a map of placeholder to content indexed by message ids
export function extractPlaceholders(messageBundle: MessageBundle) {
  const messageMap = messageBundle.getMessageMap();
  let placeholders: {[id: string]: {[name: string]: string}} = {};

  Object.keys(messageMap).forEach(msgId => {
    placeholders[msgId] = messageMap[msgId].placeholders;
  });

  return placeholders;
}

// Generate a map of placeholder to message ids indexed by message ids
export function extractPlaceholderToIds(messageBundle: MessageBundle) {
  const messageMap = messageBundle.getMessageMap();
  let placeholderToIds: {[id: string]: {[name: string]: string}} = {};

  Object.keys(messageMap).forEach(msgId => {
    placeholderToIds[msgId] = messageMap[msgId].placeholderToMsgIds;
  });

  return placeholderToIds;
}
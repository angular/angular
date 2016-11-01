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
  write(messages: i18n.Message[]): string;

  load(content: string, url: string, messageBundle: MessageBundle): {[id: string]: html.Node[]};

  digest(message: i18n.Message): string;
}
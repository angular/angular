/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as html from '../../ml_parser/ast';
import * as i18n from '../i18n_ast';

export interface Serializer {
  write(messageMap: {[id: string]: i18n.Message}): string;

  load(content: string, url: string, placeholders: {[id: string]: {[name: string]: string}}):
      {[id: string]: html.Node[]};
}
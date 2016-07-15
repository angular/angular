/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as i18nAst from '../i18n_ast';

export interface Serializer {
  write(messageMap: {[k: string]: i18nAst.Message}): string;

  load(content: string): {[k: string]: i18nAst.Node[]};
}
/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {GrammarDefinition} from './types';

/** Highlighting definition for Angular HTML templates. */
export const AngularHtml: GrammarDefinition = {
  scopeName: 'text.angular-html',
  patterns: [{include: 'text.html.derivative'}],
};

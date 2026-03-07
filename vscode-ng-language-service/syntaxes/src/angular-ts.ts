/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {GrammarDefinition} from './types';

/** Highlighting definition for Angular TypeScript code. */
export const AngularTs: GrammarDefinition = {
  scopeName: 'source.angular-ts',
  patterns: [
    {include: 'inline-template.ng'},
    {include: 'inline-styles.ng'},
    {include: 'source.ts'},
  ],
};

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ParserContext} from '../utils.mjs';

export const parserContext: ParserContext = {
  apiEntries: {
    CommonModule: 'angular/common',
    bootstrapApplication: '@angular/platform-browser',
    ApplicationRef: 'angular/core',
    Router: 'angular/router',
  },
};

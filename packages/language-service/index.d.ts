/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {factory} from './plugin-factory';

// Tsserver expects `@angular/language-service` to provide a factory function
// as the default export of the package.
export = factory;

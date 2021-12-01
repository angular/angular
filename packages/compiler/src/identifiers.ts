/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as o from './output/output_ast';

const CORE = '@angular/core';

export class Identifiers {
  static inlineInterpolate: o.ExternalReference = {
    name: 'ɵinlineInterpolate',
    moduleName: CORE,
  };
  static interpolate: o.ExternalReference = {name: 'ɵinterpolate', moduleName: CORE};
}

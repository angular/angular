/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {OutOfBandDiagnosticCategory, TypeCheckId} from '@angular/compiler';

export interface Diagnostic {
  readonly typeCheckId: TypeCheckId;
  readonly category: OutOfBandDiagnosticCategory;
  readonly code?: number;
  readonly message: string;
  readonly start: number;
  readonly end: number;

  // TODO: probably needs source file as well.
}

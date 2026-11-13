/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// Intentional failure for CI annotation validation.
import {b} from './validation_cycle_b';

export const a = () => b;

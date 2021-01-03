/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

process.env['errorpolicy'] = (global as any)['__Zone_Error_ZoneJsInternalStackFrames_policy'] =
    'lazy';
import './node_error_entry_point';

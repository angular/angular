/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {TrustedHTML, TrustedScript, TrustedScriptURL} from '../../util/security/trusted_type_defs';

/**
 * Function used to sanitize the value before writing it into the renderer.
 */
export type SanitizerFn = (value: any, tagName?: string, propName?: string) =>
    string|TrustedHTML|TrustedScript|TrustedScriptURL;

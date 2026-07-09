/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {MATH_ML_NAMESPACE, SVG_NAMESPACE} from '../sanitization/dom_security_schema';

export const NAMESPACE_URIS: Record<string, string> = {
  'http://www.w3.org/2000/svg': SVG_NAMESPACE,
  'http://www.w3.org/1998/Math/MathML': MATH_ML_NAMESPACE,
};

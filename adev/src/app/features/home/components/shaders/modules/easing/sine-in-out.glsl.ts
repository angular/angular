/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

export default /* glsl */ `
#ifndef PI
#define PI 3.141592653589793
#endif

float sineInOut(float t) {
  return -0.5 * (cos(PI * t) - 1.0);
}
`;

/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

export default /* glsl */ `
float msdf(sampler2D image, vec2 uv) {
  vec3 tex = texture2D(image, uv).rgb;
  float signedDist = max(min(tex.r, tex.g), min(max(tex.r, tex.g), tex.b)) - 0.5;
  float d = fwidth(signedDist);
  return smoothstep(-d, d, signedDist);
}
`;

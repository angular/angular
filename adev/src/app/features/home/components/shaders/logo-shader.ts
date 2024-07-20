/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import sdPolygon from './modules/sdf-primitives/sd-polygon.glsl';

const vertex = /* glsl */ `
attribute vec3 position;
attribute vec2 uv;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

varying vec2 vUv;

void main() {
  vUv = uv;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragment = /* glsl */ `
precision highp float;

uniform vec3 uColor;
uniform float uProgress;
uniform float uAlpha;

varying vec2 vUv;

#define MAX_NUM_VERTICES 5

${sdPolygon}

void main() {
  // Polygon animation
  vec2[MAX_NUM_VERTICES] bottom;
  bottom[0] = vec2(0.292446808510638, 1.0 - mix(0.7381, 0.7781, uProgress));
  bottom[1] = vec2(mix(0.239468085106383, 0.133085106382979, uProgress), 1.0 - mix(0.8592, 0.7781, uProgress));
  bottom[2] = vec2(0.50031914893617, 1.0 - 1.0);
  bottom[3] = vec2(mix(0.761170212765957, 0.867553191489362, uProgress), 1.0 - mix(0.8592, 0.7781, uProgress));
  bottom[4] = vec2(0.707553191489362, 1.0 - mix(0.7381, 0.7781, uProgress));

  vec2[MAX_NUM_VERTICES] right;
  right[0] = vec2(mix(0.618404255319149, 0.597127659574468, uProgress), 1.0 - 0.0);
  right[1] = vec2(0.964042553191489, 1.0 - mix(0.7023, 0.6623, uProgress));
  right[2] = vec2(1.0, 1.0 - 0.1665);

  vec2[MAX_NUM_VERTICES] left;
  left[0] = vec2(mix(0.381595744680851, 0.402872340425532, uProgress), 1.0 - 0.0);
  left[1] = vec2(0.035957446808511, 1.0 - mix(0.7023, 0.6623, uProgress));
  left[2] = vec2(0.0, 1.0 - 0.1665);

  float sdBottom = sdPolygon(vUv, bottom, 5);
  float sdRight = sdPolygon(vUv, right, 3);
  float sdLeft = sdPolygon(vUv, left, 3);

  // Anti-alias
  float dBottom = fwidth(sdBottom);
  float alphaBottom = smoothstep(dBottom, -dBottom, sdBottom);
  float dRight = fwidth(sdRight);
  float alphaRight = smoothstep(dRight, -dRight, sdRight);
  float dLeft = fwidth(sdLeft);
  float alphaLeft = smoothstep(dLeft, -dLeft, sdLeft);

  float alpha = max(alphaBottom, alphaRight);
  alpha = max(alpha, alphaLeft);
  alpha *= uAlpha;

  if (alpha < 0.01) {
    discard;
  }

  gl_FragColor.rgb = uColor;
  gl_FragColor.a = alpha;
}
`;

export default {
  vertex100: vertex,

  fragment100: /* glsl */ `#extension GL_OES_standard_derivatives : enable
precision highp float;
${fragment}`,

  vertex300: /* glsl */ `#version 300 es
#define attribute in
#define varying out
${vertex}`,

  fragment300: /* glsl */ `#version 300 es
precision highp float;
#define varying in
#define texture2D texture
#define gl_FragColor FragColor
out vec4 FragColor;
${fragment}`,
};

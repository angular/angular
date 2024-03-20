/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import msdf from './modules/msdf/msdf.glsl';

const vertex = /* glsl */ `
attribute vec3 position;
attribute vec2 uv;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

attribute mat4 instanceMatrix;
attribute float instanceColorIndex;
attribute float instanceRandom;
attribute float instanceOpacity;

uniform vec3 uPinkColor[2];
uniform vec3 uPurpleColor[2];
uniform vec3 uRedColor[2];

varying vec2 vUv;
varying vec3 vColor[2];
varying float vInstanceRandom;
varying float vInstanceOpacity;

void main() {
  vUv = uv;

  if (instanceColorIndex == 0.0) {
    vColor[0] = uPinkColor[0];
    vColor[1] = uPinkColor[1];
  } else if (instanceColorIndex == 1.0) {
    vColor[0] = uPurpleColor[0];
    vColor[1] = uPurpleColor[1];
  } else if (instanceColorIndex == 2.0) {
    vColor[0] = uRedColor[0];
    vColor[1] = uRedColor[1];
  }

  vInstanceRandom = instanceRandom;
  vInstanceOpacity = instanceOpacity;

  gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
}
`;

const fragment = /* glsl */ `
precision highp float;

uniform sampler2D tMap;
uniform float uTime;

varying vec2 vUv;
varying vec3 vColor[2];
varying float vInstanceRandom;
varying float vInstanceOpacity;

${msdf}

void main() {
  float alpha = msdf(tMap, vUv);
  alpha *= vInstanceOpacity;

  if (alpha < 0.01) {
    discard;
  }

  vec2 uv = vUv;
  uv.x += vInstanceRandom * uTime * 0.5;

  uv.x = fract(uv.x); // Wrap around 1.0

  // Linear gradient, mirrored for wrapping
  vec3 color = mix(vColor[0], vColor[1], smoothstep(0.0, 0.3333, uv.x));
  color = mix(color, vColor[1], smoothstep(0.3333, 0.6666, uv.x));
  color = mix(color, vColor[0], smoothstep(0.6666, 1.0, uv.x));

  gl_FragColor.rgb = color;
  gl_FragColor.a = smoothstep(1.0, 0.3333, vUv.x) * alpha;
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

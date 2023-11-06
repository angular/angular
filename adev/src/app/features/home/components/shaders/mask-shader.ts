/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

const vertex = /* glsl */ `
attribute vec3 position;
attribute vec2 uv;

varying vec2 vUv;

void main() {
  vUv = uv;

  gl_Position = vec4(position, 1.0);
}
`;

const fragment = /* glsl */ `
precision highp float;

uniform sampler2D tMap;
uniform sampler2D tMask;
uniform float uDebug;

varying vec2 vUv;

void main() {
  if (uDebug == 1.0) {
    gl_FragColor = max(texture2D(tMap, vUv), texture2D(tMask, vUv));
  } else {
    gl_FragColor = texture2D(tMap, vUv);
    gl_FragColor.a = texture2D(tMask, vUv).g;
  }
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

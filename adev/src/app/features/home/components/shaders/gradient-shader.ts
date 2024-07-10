/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import sineInOut from './modules/easing/sine-in-out.glsl';

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

uniform sampler2D tMap;
uniform vec3 uGrayColor;
uniform float uProgress;
uniform float uAlpha;
uniform float uDebug;
uniform float uTime;

varying vec2 vUv;

${sineInOut}

void main() {
  float time = fract(uTime / 6.0);
  float t = abs(2.0 * time - 1.0);

  // Rotation starts at 35.642°, 3 sec 180° and 6 sec 360°
  float currentAngle = 35.642 + time * 360.0;

  vec2 uv = vUv;
  uv.x -= 0.1 * (1.0 - sineInOut(t));

  vec2 origin = vec2(0.5, 0.5);
  uv -= origin;

  float angle = radians(currentAngle) + atan(uv.y, uv.x);

  float len = length(uv);
  uv = vec2(cos(angle) * len, sin(angle) * len) + origin;

  gl_FragColor = texture2D(tMap, uv);

  if (uDebug == 1.0) {
    // Anti-aliased outer circle
    float radius = 0.5;
    float d = fwidth(len);
    float circle = smoothstep(radius - d, radius + d, len);

    gl_FragColor.a = (1.0 - circle) * uAlpha;

    // Anti-aliased center point
    radius = 0.005;
    circle = smoothstep(radius - d, radius + d, len);

    gl_FragColor.rgb = mix(vec3(1), gl_FragColor.rgb, circle);
  } else {
    gl_FragColor.a *= uAlpha;
  }

  if (uProgress > 0.0) {
    // Anti-aliased gray unfilled angle
    float theta = radians(20.0);
    uv = vec2(cos(theta) * vUv.x - sin(theta) * vUv.y,
              sin(theta) * vUv.x + cos(theta) * vUv.y);

    float progress = 2.0 * uProgress - 1.0;
    float d = 0.001;
    float angle = smoothstep(uv.x - d, uv.x + d, progress);

    gl_FragColor.rgb = mix(uGrayColor, gl_FragColor.rgb, angle);
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

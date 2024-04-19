/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Color, OGLRenderingContext, Program} from 'ogl';

import LogoShader from '../shaders/logo-shader';

const {vertex100, fragment100, vertex300, fragment300} = LogoShader;

/**
 * Signed distance field (SDF) shader program for the outer polygons of the logo.
 *
 * @see {@link LogoShader} for the GLSL shader.
 */
export class LogoProgram extends Program {
  /**
   * Create the shader program.
   */
  constructor(gl: OGLRenderingContext, color: Color) {
    super(gl, {
      uniforms: {
        uColor: {value: color},
        uProgress: {value: 0},
        uAlpha: {value: 1},
      },
      vertex: gl.renderer.isWebgl2 ? vertex300 : vertex100,
      fragment: gl.renderer.isWebgl2 ? fragment300 : fragment100,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });
  }
}

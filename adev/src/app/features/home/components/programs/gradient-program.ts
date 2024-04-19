/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Color, OGLRenderingContext, Program, Texture} from 'ogl';

import GradientShader from '../shaders/gradient-shader';

const {vertex100, fragment100, vertex300, fragment300} = GradientShader;

/**
 * Gradient shader program for the background of the Angular logo.
 *
 * @see {@link GradientShader} for the GLSL shader.
 */
export class GradientProgram extends Program {
  /**
   * Create the shader program.
   */
  constructor(gl: OGLRenderingContext, texture: Texture, window: Window) {
    super(gl, {
      uniforms: {
        tMap: {value: texture},
        uGrayColor: {value: new Color(0xa39fa9)},
        uProgress: {value: 0},
        uAlpha: {value: 1},
        uDebug: {value: /[?&]gradient/.test(window.location.search) ? 1 : 0},
        uTime: {value: 0},
      },
      vertex: gl.renderer.isWebgl2 ? vertex300 : vertex100,
      fragment: gl.renderer.isWebgl2 ? fragment300 : fragment100,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });
  }
}

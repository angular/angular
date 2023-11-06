/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {OGLRenderingContext, Program} from 'ogl';

import MaskShader from '../shaders/mask-shader';

const {vertex100, fragment100, vertex300, fragment300} = MaskShader;

/**
 * Alpha mask shader program for the Angular logo.
 *
 * Uses the green channel of the mask texture as the output alpha channel of the gradient map
 * texture, creating a mask of the logo with the gradient background inside the logo.
 *
 * @see {@link MaskShader} for the GLSL shader.
 */
export class MaskProgram extends Program {
  /**
   * Create the shader program.
   */
  constructor(gl: OGLRenderingContext, window: Window) {
    super(gl, {
      uniforms: {
        tMap: {value: null},
        tMask: {value: null},
        uDebug: {value: /[?&]debug|gradient/.test(window.location.search) ? 1 : 0},
      },
      vertex: gl.renderer.isWebgl2 ? vertex300 : vertex100,
      fragment: gl.renderer.isWebgl2 ? fragment300 : fragment100,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });
  }
}

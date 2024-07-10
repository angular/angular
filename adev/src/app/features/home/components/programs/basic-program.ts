/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {OGLRenderingContext, Program, Texture} from 'ogl';

import BasicShader from '../shaders/basic-shader';

const {vertex100, fragment100, vertex300, fragment300} = BasicShader;

/**
 * Basic texture map shader program with alpha channel for the "Build for everyone" heading.
 *
 * @see {@link BasicShader} for the GLSL shader.
 */
export class BasicProgram extends Program {
  /**
   * Create the shader program.
   */
  constructor(gl: OGLRenderingContext, texture: Texture) {
    super(gl, {
      uniforms: {
        tMap: {value: texture},
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

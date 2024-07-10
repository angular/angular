/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Color, OGLRenderingContext, Program, Texture} from 'ogl';

import GlyphShader from '../shaders/glyph-shader';

const {vertex100, fragment100, vertex300, fragment300} = GlyphShader;

/**
 * Multi-channel signed distance field (MSDF) shader program for the inner triangle and "Angular"
 * letters of the logo, and the "Build for everyone" heading.
 *
 * Textures generated with `msdfgen`, which includes support for advanced SVG decoding:
 * `msdfgen -svg logo-lockup.svg -o logo-lockup-msdf.png -size 700 172 -testrender logo-lockup-render.png 700 172`
 * `msdfgen -svg build-for-everyone.svg -o build-msdf.png -size 433 58 -autoframe -testrender build-render.png 433 58`
 *
 * @see {@link GlyphShader} for the GLSL shader.
 */
export class GlyphProgram extends Program {
  /**
   * Create the shader program.
   */
  constructor(gl: OGLRenderingContext, texture: Texture, color: Color) {
    super(gl, {
      uniforms: {
        tMap: {value: texture},
        uColor: {value: color},
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

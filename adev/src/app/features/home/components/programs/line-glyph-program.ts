/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Color, OGLRenderingContext, Program, Texture} from 'ogl';

import LineGlyphShader from '../shaders/line-glyph-shader';

const {vertex100, fragment100, vertex300, fragment300} = LineGlyphShader;

/**
 * Multi-channel signed distance field (MSDF) shader program for a line instance.
 *
 * Textures generated with `msdfgen`, which includes support for advanced SVG decoding:
 * `msdfgen -svg line.svg -o line-msdf.png -size 235 300 -testrender line-render.png 235 300`
 *
 * @see {@link LineGlyphShader} for the GLSL shader.
 */
export class LineGlyphProgram extends Program {
  /**
   * Create the shader program.
   */
  constructor(gl: OGLRenderingContext, texture: Texture) {
    super(gl, {
      uniforms: {
        tMap: {value: texture},
        uPinkColor: {value: [new Color(0xf65fe3), new Color(0x873df5)]},
        uPurpleColor: {value: [new Color(0xb666f2), new Color(0xea3a8a)]},
        uRedColor: {value: [new Color(0xe92d64), new Color(0xf469e4)]},
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

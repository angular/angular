/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {OGLRenderingContext, Texture, TextureLoader} from 'ogl';

/**
 * Load a texture.
 * @example
 * const texture = await loadTexture(gl, 'assets/textures/line-msdf.png');
 * texture.minFilter = gl.LINEAR;
 * texture.generateMipmaps = false;
 */
export function loadTexture(gl: OGLRenderingContext, src: string): Promise<Texture> {
  const texture = TextureLoader.load(gl, {src});
  return texture.loaded!.then(() => texture);
}

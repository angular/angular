/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Color, Mesh, OGLRenderingContext, Plane, Texture, Vec2} from 'ogl';

import {View} from './view';
import {GlyphProgram} from '../programs/glyph-program';

import {toRadians} from '../../utils/math';

/**
 * An OGL `Transform` used for the animation of the inner triangle and "Angular" letters of the logo.
 *
 * The `userData` object is used for the GSAP animation, and the `override update(): void` method
 * applies the values to the `Transform`.
 */
export class AngularGlyph extends View {
  private origin: Vec2;
  private mesh!: Mesh;

  /**
   * Create a glyph view.
   */
  constructor(
    private readonly gl: OGLRenderingContext,
    private readonly texture: Texture,
    private readonly color: Color,
    private translate: Vec2 = new Vec2(0.5, -0.5), // Top left
  ) {
    super();

    this.userData['x'] = 0;
    this.userData['y'] = 0;
    this.userData['rotation'] = 0;
    this.userData['scale'] = 1;
    this.userData['opacity'] = 1;
    this.userData['width'] = 700;
    this.userData['height'] = 172;

    this.origin = new Vec2(
      Math.round(this.userData['width'] * (this.translate.x - 0.5)),
      Math.round(this.userData['height'] * (this.translate.y + 0.5)),
    );

    this.translate = new Vec2(
      Math.round(this.userData['width'] * this.translate.x),
      Math.round(this.userData['height'] * this.translate.y),
    );

    this.init();
  }

  /**
   * Initialize geometry, program and mesh for the view.
   */
  override init(): void {
    const geometry = new Plane(this.gl);

    const program = new GlyphProgram(this.gl, this.texture, this.color);

    const mesh = new Mesh(this.gl, {geometry, program});
    mesh.frustumCulled = false;
    mesh.position.set(this.translate.x, this.translate.y, 0); // Offset mesh for transform origin
    mesh.scale.set(this.userData['width'], this.userData['height'], 1);
    this.addChild(mesh);

    this.mesh = mesh;
  }

  /**
   * Update position, rotation and scale of the view, and alpha uniform of the program.
   */
  override update(): void {
    this.position.x = -this.origin.x + this.userData['x'];
    this.position.y = -this.origin.y + -this.userData['y']; // Y flipped

    this.rotation.z = -toRadians(this.userData['rotation']);

    this.scale.set(this.userData['scale']);

    this.mesh.program.uniforms['uAlpha'].value =
      this.userData['opacity'] * this.parent!.userData['opacity'];
  }
}

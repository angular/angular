/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Color, Mesh, OGLRenderingContext, Plane, Vec2} from 'ogl';

import {View} from './view';
import {LogoProgram} from '../programs/logo-program';

import {toRadians} from '../../utils/math';

/**
 * An OGL `Transform` used for the animation of the outer polygons of the logo.
 *
 * The `userData` object is used for the GSAP animation, and the `override update(): void` method
 * applies the values to the `Transform`.
 */
export class AngularLogo extends View {
  private origin: Vec2;
  private mesh!: Mesh;

  /**
   * Create the logo view.
   */
  constructor(
    private readonly gl: OGLRenderingContext,
    private readonly color: Color,
    private translate: Vec2 = new Vec2(), // Center
  ) {
    super();

    this.userData['x'] = 0;
    this.userData['y'] = 0;
    this.userData['rotation'] = 0;
    this.userData['scale'] = 1;
    this.userData['opacity'] = 1;
    this.userData['width'] = 158.6;
    this.userData['height'] = 168;
    this.userData['progress'] = 0;

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

    const program = new LogoProgram(this.gl, this.color);

    const mesh = new Mesh(this.gl, {geometry, program});
    mesh.frustumCulled = false;
    mesh.position.set(this.translate.x, this.translate.y, 0); // Offset mesh for transform origin
    mesh.scale.set(this.userData['width'], this.userData['height'], 1);
    this.addChild(mesh);

    this.mesh = mesh;
  }

  /**
   * Update position, rotation and scale of the view, and progress and alpha uniforms of the
   * program.
   */
  override update(): void {
    this.position.x = -this.origin.x + this.userData['x'];
    this.position.y = -this.origin.y + -this.userData['y']; // Y flipped

    this.rotation.z = -toRadians(this.userData['rotation']);

    this.scale.set(this.userData['scale']);

    this.mesh.program.uniforms['uProgress'].value = this.userData['progress'];
    this.mesh.program.uniforms['uAlpha'].value =
      this.userData['opacity'] * this.parent!.userData['opacity'];
  }
}

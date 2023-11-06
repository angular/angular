/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Mesh, OGLRenderingContext, Plane} from 'ogl';

import {View} from './view';
import {GradientProgram} from '../programs/gradient-program';

import {toRadians} from '../../utils/math';
import {loadTexture} from '../../utils/ogl';

/**
 * An OGL `Transform` used for the animation of the gradient background.
 *
 * The `userData` object is used for the GSAP animation, and the `override update(): void` method
 * applies the values to the `Transform`.
 */
export class Gradient extends View {
  private viewWidth = 700;
  private viewScale = 1;
  private mesh!: Mesh;

  /**
   * Create the gradient background.
   */
  constructor(
    private readonly gl: OGLRenderingContext,
    private readonly document: Document,
    private readonly window: Window,
  ) {
    super();

    this.userData['x'] = 0;
    this.userData['y'] = 0;
    this.userData['rotation'] = 0;
    this.userData['scale'] = 1;
    this.userData['opacity'] = 1;
    this.userData['progress'] = 0;
    this.userData['buildWidth'] = 0; // Used for the "Build for everyone" heading width
  }

  /**
   * Initialize geometry, program and mesh for the view.
   */
  override async init(): Promise<void> {
    const texture = await loadTexture(this.gl, 'assets/textures/gradient.jpg');

    const geometry = new Plane(this.gl);

    const program = new GradientProgram(this.gl, texture, this.window);

    const mesh = new Mesh(this.gl, {geometry, program});
    mesh.frustumCulled = false;
    this.addChild(mesh);

    this.mesh = mesh;
  }

  /**
   * Update color uniforms of the material, based on the current theme.
   */
  override theme(): void {
    const rootStyle = getComputedStyle(this.document.querySelector(':root')!);

    this.mesh.program.uniforms['uGrayColor'].value.set(
      rootStyle.getPropertyValue('--webgl-gray-unfilled').trim(),
    );
  }

  /**
   * Update size and position of the view, based on the size of the screen.
   */
  override resize(width: number, height: number, dpr: number, scale: number): void {
    this.viewScale = scale;

    // The gradient is 1.34x the width of the Angular logo
    const size = this.viewWidth * this.viewScale * 1.34;
    this.userData['width'] = size;
    this.userData['height'] = size;
  }

  /**
   * Update position, rotation and scale of the view, position and scale of the mesh, and progress,
   * alpha and time uniforms of the program.
   */
  override update(time: number): void {
    this.position.x = this.userData['x'];
    this.position.y = -this.userData['y']; // Y flipped

    this.rotation.z = -toRadians(this.userData['rotation']);

    this.scale.set(this.userData['scale']);

    if (this.userData['progress'] > 0) {
      // "Build for everyone" gradient centered, same width as the heading
      this.mesh.position.set(0);
      this.mesh.scale.set(this.userData['buildWidth'], this.userData['buildWidth'], 1);
    } else {
      // Positioned relative to the Angular logo, Y flipped
      this.mesh.position.set(-102 * this.viewScale, -40 * this.viewScale, 0);
      this.mesh.scale.set(this.userData['width'], this.userData['height'], 1);
    }

    this.mesh.program.uniforms['uProgress'].value = this.userData['progress'];
    this.mesh.program.uniforms['uAlpha'].value =
      this.userData['opacity'] * this.parent!.userData['opacity'];
    this.mesh.program.uniforms['uTime'].value = time;
  }

  /**
   * Promise for the child views when they're ready.
   */
  override ready(): Promise<void> {
    return this.init();
  }
}

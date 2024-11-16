/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {OGLRenderingContext, Vec2} from 'ogl';

import {View} from './view';
import {Gradient} from './gradient';

import {toRadians} from '../../utils/math';

/**
 * An OGL `Transform` used for the top-level view of the gradient background.
 *
 * The `userData` object is used for the GSAP animation, and the `override update(): void` method
 * applies the values to the `Transform`.
 */
export class GradientView extends View {
  private origin: Vec2;

  background!: Gradient;

  /**
   * Create the gradient view.
   */
  constructor(
    private readonly gl: OGLRenderingContext,
    private readonly document: Document,
    private readonly window: Window,
  ) {
    super();

    this.visible = false;

    this.userData['x'] = 0;
    this.userData['y'] = 0;
    this.userData['rotation'] = 0;
    this.userData['scale'] = 1;
    this.userData['opacity'] = 1;

    this.origin = new Vec2();

    this.init();
  }

  /**
   * Initialize child views.
   */
  override init(): void {
    this.background = new Gradient(this.gl, this.document, this.window);
    this.addChild(this.background);
  }

  /**
   * Update the theme of child views.
   */
  override theme(): void {
    this.background.theme();
  }

  /**
   * Resize the child views.
   */
  override resize(width: number, height: number, dpr: number, scale: number): void {
    // Centered
    this.origin.set(Math.round(width / 2), Math.round(height / 2));

    this.background.resize(width, height, dpr, scale);
  }

  /**
   * Update position, rotation and scale of the view, and child views.
   */
  override update(time: number): void {
    this.position.x = this.origin.x + this.userData['x'];
    this.position.y = -this.origin.y + -this.userData['y']; // Y flipped

    this.rotation.z = -toRadians(this.userData['rotation']);

    this.scale.set(this.userData['scale']);

    // "Build for everyone" gradient centered, scale set by the child view
    if (this.background.userData['progress'] > 0) {
      this.position.x = this.origin.x;
      this.position.y = -this.origin.y; // Y flipped

      this.scale.set(1);
    }

    this.visible = this.userData['opacity'] > 0;

    this.background.update(time);
  }

  /**
   * Promise for the child views when they're ready.
   */
  override ready(): Promise<void> {
    return this.background.init();
  }
}

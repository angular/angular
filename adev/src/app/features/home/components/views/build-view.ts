/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {OGLRenderingContext, Vec2} from 'ogl';

import {View} from './view';
import {BuildText} from './build-text';

import {toRadians} from '../../utils/math';

/**
 * An OGL `Transform` used for the top-level view of the build section.
 *
 * The `userData` object is used for the GSAP animation, and the `override update(): void` method
 * applies the values to the `Transform`.
 */
export class BuildView extends View {
  private origin: Vec2;

  text!: BuildText;

  /**
   * Create the build view.
   */
  constructor(
    private readonly gl: OGLRenderingContext,
    private readonly document: Document,
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
    this.text = new BuildText(this.gl, this.document);
    this.addChild(this.text);
  }

  /**
   * Update size and position of the view, based on the size of the screen, and child views.
   */
  override resize(width: number, height: number, dpr: number, scale: number): void {
    // Centered
    this.origin.set(Math.round(width / 2), Math.round(height / 2));

    this.text.resize(width, height, dpr, scale);
  }

  /**
   * Update position, rotation and scale of the view, and child views.
   */
  override update(): void {
    this.position.x = this.origin.x + this.userData['x'];
    this.position.y = -this.origin.y + -this.userData['y']; // Y flipped

    this.rotation.z = -toRadians(this.userData['rotation']);

    this.scale.set(this.userData['scale']);

    this.visible = this.userData['opacity'] > 0;

    this.text.update();
  }

  /**
   * Promise for the child views when they're ready.
   */
  override ready(): Promise<void> {
    return this.text.init();
  }
}

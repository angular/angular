/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {isMobile} from '@angular/docs';
import type {OGLRenderingContext} from 'ogl';

import {View} from './view';
import {Lines} from './lines';

/**
 * An OGL `Transform` used for the top-level view of the lines section.
 */
export class LinesView extends View {
  // Number of divisions on a square grid
  // For example 9 × 9 = 81 line instances
  private divisions = isMobile ? 9 : 14;

  container!: Lines;

  /**
   * Create the lines view.
   */
  constructor(private readonly gl: OGLRenderingContext) {
    super();

    this.visible = false;

    // Center the container
    const offset = this.divisions - 2;
    this.position.x = -offset;
    this.position.y = -offset;

    this.init();
  }

  /**
   * Initialize child views.
   */
  override init(): void {
    this.container = new Lines(this.gl, this.divisions);
    this.addChild(this.container);
  }

  /**
   * Update the child views.
   */
  override update(time: number): void {
    this.visible = this.container.userData['opacity'] > 0;

    this.container.update(time);
  }

  /**
   * Promise for the child views when they're ready.
   */
  override ready(): Promise<void> {
    return this.container.init();
  }
}

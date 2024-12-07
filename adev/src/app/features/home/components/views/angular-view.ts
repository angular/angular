/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import type {OGLRenderingContext} from 'ogl';

import {View} from './view';
import {Angular} from './angular';

/**
 * An OGL `Transform` used for the top-level view of the Angular logo mask.
 */
export class AngularView extends View {
  wordmark!: Angular;

  /**
   * Create the mask view.
   */
  constructor(private readonly gl: OGLRenderingContext) {
    super();

    this.visible = false;

    this.userData['visible'] = this.visible;

    this.init();
  }

  /**
   * Initialize child views.
   */
  override init(): void {
    this.wordmark = new Angular(this.gl);
    this.addChild(this.wordmark);
  }

  /**
   * Resize the child views.
   */
  override resize(width: number, height: number, dpr: number, scale: number): void {
    this.wordmark.resize(width, height, dpr, scale);
  }

  /**
   * Update the child views.
   */
  override update(): void {
    this.visible = this.userData['visible'];

    this.wordmark.update();
  }

  /**
   * Promise for the child views when they're ready.
   */
  override ready(): Promise<void> {
    return this.wordmark.init();
  }
}

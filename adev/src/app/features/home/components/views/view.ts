/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Transform} from 'ogl';

/**
 * An OGL `Transform` used as a base class for implementing views.
 */
export class View extends Transform {
  /**
   * The parent.
   */
  override parent: View | null = null;

  /**
   * An array with the children.
   */
  override children: View[] = [];

  /**
   * An object for storing custom data.
   */
  userData: Record<string, any> = {};

  /**
   * Stub for initializing child views.
   */
  init(): void {}

  /**
   * Stub for updating child views, based on the current theme.
   */
  theme(): void {}

  /**
   * Stub for resizing child views.
   */
  resize(width?: number, height?: number, dpr?: number, scale?: number): void {}

  /**
   * Stub for updating child views.
   */
  update(time?: number, deltaTime?: number, frame?: number, progress?: number): void {}

  /**
   * Stub for initializing child views when they're ready.
   */
  ready(): void | Promise<void> {}

  /**
   * Destroys the child views and empties the children array.
   */
  destroy(): void {
    for (let i = this.children.length - 1; i >= 0; i--) {
      if ('destroy' in this.children[i]) {
        this.children[i].destroy();
      }
    }

    this.children.length = 0;
  }
}

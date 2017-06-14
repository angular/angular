/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable} from '@angular/core';
import {OverlayContainer} from './overlay-container';

/**
 * The FullscreenOverlayContainer is the alternative to OverlayContainer
 * that supports correct displaying of overlay elements in Fullscreen mode
 * https://developer.mozilla.org/en-US/docs/Web/API/Element/requestFullScreen
 * It should be provided in the root component that way:
 * providers: [
 *   {provide: OverlayContainer, useClass: FullscreenOverlayContainer}
 * ],
 */
@Injectable()
export class FullscreenOverlayContainer extends OverlayContainer {
  protected _createContainer(): void {
    super._createContainer();
    this._adjustParentForFullscreenChange();
    this._addFullscreenChangeListener(() => this._adjustParentForFullscreenChange());
  }

  private _adjustParentForFullscreenChange(): void {
    if (!this._containerElement) {
      return;
    }
    let fullscreenElement = this.getFullscreenElement();
    let parent = fullscreenElement || document.body;
    parent.appendChild(this._containerElement);
  }

  private _addFullscreenChangeListener(fn: () => void) {
    if (document.fullscreenEnabled) {
      document.addEventListener('fullscreenchange', fn);
    } else if (document.webkitFullscreenEnabled) {
      document.addEventListener('webkitfullscreenchange', fn);
    } else if ((document as any).mozFullScreenEnabled) {
      document.addEventListener('mozfullscreenchange', fn);
    } else if ((document as any).msFullscreenEnabled) {
      document.addEventListener('MSFullscreenChange', fn);
    }
  }

  /**
   * When the page is put into fullscreen mode, a specific element is specified.
   * Only that element and its children are visible when in fullscreen mode.
  */
  getFullscreenElement(): Element {
    return document.fullscreenElement ||
        document.webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement ||
        null;
  }
}

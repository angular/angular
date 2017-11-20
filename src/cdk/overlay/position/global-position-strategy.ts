/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {PositionStrategy} from './position-strategy';
import {OverlayRef} from '../overlay-ref';


/**
 * A strategy for positioning overlays. Using this strategy, an overlay is given an
 * explicit position relative to the browser's viewport. We use flexbox, instead of
 * transforms, in order to avoid issues with subpixel rendering which can cause the
 * element to become blurry.
 */
export class GlobalPositionStrategy implements PositionStrategy {
  /** The overlay to which this strategy is attached. */
  private _overlayRef: OverlayRef;

  private _cssPosition: string = 'static';
  private _topOffset: string = '';
  private _bottomOffset: string = '';
  private _leftOffset: string = '';
  private _rightOffset: string = '';
  private _alignItems: string = '';
  private _justifyContent: string = '';
  private _width: string = '';
  private _height: string = '';

  /* A lazily-created wrapper for the overlay element that is used as a flex container.  */
  private _wrapper: HTMLElement | null = null;

  constructor(private _document: any) {}

  attach(overlayRef: OverlayRef): void {
    this._overlayRef = overlayRef;
  }

  /**
   * Sets the top position of the overlay. Clears any previously set vertical position.
   * @param value New top offset.
   */
  top(value: string = ''): this {
    this._bottomOffset = '';
    this._topOffset = value;
    this._alignItems = 'flex-start';
    return this;
  }

  /**
   * Sets the left position of the overlay. Clears any previously set horizontal position.
   * @param value New left offset.
   */
  left(value: string = ''): this {
    this._rightOffset = '';
    this._leftOffset = value;
    this._justifyContent = 'flex-start';
    return this;
  }

  /**
   * Sets the bottom position of the overlay. Clears any previously set vertical position.
   * @param value New bottom offset.
   */
  bottom(value: string = ''): this {
    this._topOffset = '';
    this._bottomOffset = value;
    this._alignItems = 'flex-end';
    return this;
  }

  /**
   * Sets the right position of the overlay. Clears any previously set horizontal position.
   * @param value New right offset.
   */
  right(value: string = ''): this {
    this._leftOffset = '';
    this._rightOffset = value;
    this._justifyContent = 'flex-end';
    return this;
  }

  /**
   * Sets the overlay width and clears any previously set width.
   * @param value New width for the overlay
   */
  width(value: string = ''): this {
    this._width = value;

    // When the width is 100%, we should reset the `left` and the offset,
    // in order to ensure that the element is flush against the viewport edge.
    if (value === '100%') {
      this.left('0px');
    }

    return this;
  }

  /**
   * Sets the overlay height and clears any previously set height.
   * @param value New height for the overlay
   */
  height(value: string = ''): this {
    this._height = value;

    // When the height is 100%, we should reset the `top` and the offset,
    // in order to ensure that the element is flush against the viewport edge.
    if (value === '100%') {
      this.top('0px');
    }

    return this;
  }

  /**
   * Centers the overlay horizontally with an optional offset.
   * Clears any previously set horizontal position.
   *
   * @param offset Overlay offset from the horizontal center.
   */
  centerHorizontally(offset: string = ''): this {
    this.left(offset);
    this._justifyContent = 'center';
    return this;
  }

  /**
   * Centers the overlay vertically with an optional offset.
   * Clears any previously set vertical position.
   *
   * @param offset Overlay offset from the vertical center.
   */
  centerVertically(offset: string = ''): this {
    this.top(offset);
    this._alignItems = 'center';
    return this;
  }

  /**
   * Apply the position to the element.
   * @docs-private
   *
   * @returns Resolved when the styles have been applied.
   */
  apply(): void {
    const element = this._overlayRef.overlayElement;

    if (!this._wrapper && element.parentNode) {
      this._wrapper = this._document.createElement('div');
      this._wrapper!.classList.add('cdk-global-overlay-wrapper');
      element.parentNode.insertBefore(this._wrapper!, element);
      this._wrapper!.appendChild(element);
    }

    let styles = element.style;
    let parentStyles = (element.parentNode as HTMLElement).style;

    styles.position = this._cssPosition;
    styles.marginTop = this._topOffset;
    styles.marginLeft = this._leftOffset;
    styles.marginBottom = this._bottomOffset;
    styles.marginRight = this._rightOffset;
    styles.width = this._width;
    styles.height = this._height;

    parentStyles.justifyContent = this._justifyContent;
    parentStyles.alignItems = this._alignItems;
  }

  /** Removes the wrapper element from the DOM. */
  dispose(): void {
    if (this._wrapper && this._wrapper.parentNode) {
      this._wrapper.parentNode.removeChild(this._wrapper);
      this._wrapper = null;
    }
  }
}

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

  private _cssPosition = 'static';
  private _topOffset = '';
  private _bottomOffset = '';
  private _leftOffset = '';
  private _rightOffset = '';
  private _alignItems = '';
  private _justifyContent = '';
  private _width = '';
  private _height = '';

  /** A lazily-created wrapper for the overlay element that is used as a flex container. */
  private _wrapper: HTMLElement | null = null;

  constructor(private _document: any) {}

  attach(overlayRef: OverlayRef): void {
    const config = overlayRef.getConfig();

    this._overlayRef = overlayRef;

    if (this._width && !config.width) {
      overlayRef.updateSize({width: this._width});
    }

    if (this._height && !config.height) {
      overlayRef.updateSize({height: this._height});
    }
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
   * @deprecated Pass the `width` through the `OverlayConfig`.
   * @deletion-target 7.0.0
   */
  width(value: string = ''): this {
    if (this._overlayRef) {
      this._overlayRef.updateSize({width: value});
    } else {
      this._width = value;
    }

    return this;
  }

  /**
   * Sets the overlay height and clears any previously set height.
   * @param value New height for the overlay
   * @deprecated Pass the `height` through the `OverlayConfig`.
   * @deletion-target 7.0.0
   */
  height(value: string = ''): this {
    if (this._overlayRef) {
      this._overlayRef.updateSize({height: value});
    } else {
      this._height = value;
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
    // Since the overlay ref applies the strategy asynchronously, it could
    // have been disposed before it ends up being applied. If that is the
    // case, we shouldn't do anything.
    if (!this._overlayRef.hasAttached()) {
      return;
    }

    const element = this._overlayRef.overlayElement;

    if (!this._wrapper && element.parentNode) {
      this._wrapper = this._document.createElement('div');
      this._wrapper!.classList.add('cdk-global-overlay-wrapper');
      element.parentNode.insertBefore(this._wrapper!, element);
      this._wrapper!.appendChild(element);
    }

    const styles = element.style;
    const parentStyles = (element.parentNode as HTMLElement).style;
    const config = this._overlayRef.getConfig();

    styles.position = this._cssPosition;
    styles.marginLeft = config.width === '100%' ? '0' : this._leftOffset;
    styles.marginTop = config.height === '100%' ? '0' : this._topOffset;
    styles.marginBottom = this._bottomOffset;
    styles.marginRight = this._rightOffset;

    parentStyles.justifyContent = config.width === '100%' ? 'flex-start' : this._justifyContent;
    parentStyles.alignItems = config.height === '100%' ? 'flex-start' : this._alignItems;
  }

  /** Removes the wrapper element from the DOM. */
  dispose(): void {
    if (this._wrapper && this._wrapper.parentNode) {
      this._wrapper.parentNode.removeChild(this._wrapper);
      this._wrapper = null;
    }
  }
}

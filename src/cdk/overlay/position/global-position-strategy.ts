/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {PositionStrategy} from './position-strategy';
import {OverlayReference} from '../overlay-reference';

/** Class to be added to the overlay pane wrapper. */
const wrapperClass = 'cdk-global-overlay-wrapper';

/**
 * A strategy for positioning overlays. Using this strategy, an overlay is given an
 * explicit position relative to the browser's viewport. We use flexbox, instead of
 * transforms, in order to avoid issues with subpixel rendering which can cause the
 * element to become blurry.
 */
export class GlobalPositionStrategy implements PositionStrategy {
  /** The overlay to which this strategy is attached. */
  private _overlayRef: OverlayReference;
  private _cssPosition = 'static';
  private _topOffset = '';
  private _bottomOffset = '';
  private _alignItems = '';
  private _xPosition = '';
  private _xOffset = '';
  private _width = '';
  private _height = '';
  private _isDisposed = false;

  attach(overlayRef: OverlayReference): void {
    const config = overlayRef.getConfig();

    this._overlayRef = overlayRef;

    if (this._width && !config.width) {
      overlayRef.updateSize({width: this._width});
    }

    if (this._height && !config.height) {
      overlayRef.updateSize({height: this._height});
    }

    overlayRef.hostElement.classList.add(wrapperClass);
    this._isDisposed = false;
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
    this._xOffset = value;
    this._xPosition = 'left';
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
    this._xOffset = value;
    this._xPosition = 'right';
    return this;
  }

  /**
   * Sets the overlay to the start of the viewport, depending on the overlay direction.
   * This will be to the left in LTR layouts and to the right in RTL.
   * @param offset Offset from the edge of the screen.
   */
  start(value: string = ''): this {
    this._xOffset = value;
    this._xPosition = 'start';
    return this;
  }

  /**
   * Sets the overlay to the end of the viewport, depending on the overlay direction.
   * This will be to the right in LTR layouts and to the left in RTL.
   * @param offset Offset from the edge of the screen.
   */
  end(value: string = ''): this {
    this._xOffset = value;
    this._xPosition = 'end';
    return this;
  }

  /**
   * Sets the overlay width and clears any previously set width.
   * @param value New width for the overlay
   * @deprecated Pass the `width` through the `OverlayConfig`.
   * @breaking-change 8.0.0
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
   * @breaking-change 8.0.0
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
    this._xPosition = 'center';
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
   */
  apply(): void {
    // Since the overlay ref applies the strategy asynchronously, it could
    // have been disposed before it ends up being applied. If that is the
    // case, we shouldn't do anything.
    if (!this._overlayRef || !this._overlayRef.hasAttached()) {
      return;
    }

    const styles = this._overlayRef.overlayElement.style;
    const parentStyles = this._overlayRef.hostElement.style;
    const config = this._overlayRef.getConfig();
    const {width, height, maxWidth, maxHeight} = config;
    const shouldBeFlushHorizontally =
      (width === '100%' || width === '100vw') &&
      (!maxWidth || maxWidth === '100%' || maxWidth === '100vw');
    const shouldBeFlushVertically =
      (height === '100%' || height === '100vh') &&
      (!maxHeight || maxHeight === '100%' || maxHeight === '100vh');
    const xPosition = this._xPosition;
    const xOffset = this._xOffset;
    const isRtl = this._overlayRef.getConfig().direction === 'rtl';
    let marginLeft = '';
    let marginRight = '';
    let justifyContent = '';

    if (shouldBeFlushHorizontally) {
      justifyContent = 'flex-start';
    } else if (xPosition === 'center') {
      justifyContent = 'center';

      if (isRtl) {
        marginRight = xOffset;
      } else {
        marginLeft = xOffset;
      }
    } else if (isRtl) {
      if (xPosition === 'left' || xPosition === 'end') {
        justifyContent = 'flex-end';
        marginLeft = xOffset;
      } else if (xPosition === 'right' || xPosition === 'start') {
        justifyContent = 'flex-start';
        marginRight = xOffset;
      }
    } else if (xPosition === 'left' || xPosition === 'start') {
      justifyContent = 'flex-start';
      marginLeft = xOffset;
    } else if (xPosition === 'right' || xPosition === 'end') {
      justifyContent = 'flex-end';
      marginRight = xOffset;
    }

    styles.position = this._cssPosition;
    styles.marginLeft = shouldBeFlushHorizontally ? '0' : marginLeft;
    styles.marginTop = shouldBeFlushVertically ? '0' : this._topOffset;
    styles.marginBottom = this._bottomOffset;
    styles.marginRight = shouldBeFlushHorizontally ? '0' : marginRight;
    parentStyles.justifyContent = justifyContent;
    parentStyles.alignItems = shouldBeFlushVertically ? 'flex-start' : this._alignItems;
  }

  /**
   * Cleans up the DOM changes from the position strategy.
   * @docs-private
   */
  dispose(): void {
    if (this._isDisposed || !this._overlayRef) {
      return;
    }

    const styles = this._overlayRef.overlayElement.style;
    const parent = this._overlayRef.hostElement;
    const parentStyles = parent.style;

    parent.classList.remove(wrapperClass);
    parentStyles.justifyContent =
      parentStyles.alignItems =
      styles.marginTop =
      styles.marginBottom =
      styles.marginLeft =
      styles.marginRight =
      styles.position =
        '';

    this._overlayRef = null!;
    this._isDisposed = true;
  }
}

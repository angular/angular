import {applyCssTransform} from '../../style/apply-transform';
import {PositionStrategy} from './position-strategy';


/**
 * A strategy for positioning overlays. Using this strategy, an overlay is given an
 * explicit position relative to the browser's viewport.
 */
export class GlobalPositionStrategy implements PositionStrategy {
  private _cssPosition: string = 'absolute';
  private _top: string = '';
  private _bottom: string = '';
  private _left: string = '';
  private _right: string = '';

  /** Array of individual applications of translateX(). Currently only for centering. */
  private _translateX: string[] = [];

  /** Array of individual applications of translateY(). Currently only for centering. */
  private _translateY: string[] = [];

  /** Sets the element to use CSS position: fixed */
  fixed() {
    this._cssPosition = 'fixed';
    return this;
  }

  /** Sets the element to use CSS position: absolute. This is the default. */
  absolute() {
    this._cssPosition = 'absolute';
    return this;
  }

  /** Sets the top position of the overlay. Clears any previously set vertical position. */
  top(value: string) {
    this._bottom = '';
    this._translateY = [];
    this._top = value;
    return this;
  }

  /** Sets the left position of the overlay. Clears any previously set horizontal position. */
  left(value: string) {
    this._right = '';
    this._translateX = [];
    this._left = value;
    return this;
  }

  /** Sets the bottom position of the overlay. Clears any previously set vertical position. */
  bottom(value: string) {
    this._top = '';
    this._translateY = [];
    this._bottom = value;
    return this;
  }

  /** Sets the right position of the overlay. Clears any previously set horizontal position. */
  right(value: string) {
    this._left = '';
    this._translateX = [];
    this._right = value;
    return this;
  }

  /**
   * Centers the overlay horizontally with an optional offset.
   * Clears any previously set horizontal position.
   */
  centerHorizontally(offset = '0px') {
    this._left = '50%';
    this._right = '';
    this._translateX = ['-50%', offset];
    return this;
  }

  /**
   * Centers the overlay vertically with an optional offset.
   * Clears any previously set vertical position.
   */
  centerVertically(offset = '0px') {
    this._top = '50%';
    this._bottom = '';
    this._translateY = ['-50%', offset];
    return this;
  }

  /**
   * Apply the position to the element.
   * TODO: internal
   */
  apply(element: HTMLElement): Promise<void> {
    element.style.position = this._cssPosition;
    element.style.top = this._top;
    element.style.left = this._left;
    element.style.bottom = this._bottom;
    element.style.right = this._right;

    // TODO(jelbourn): we don't want to always overwrite the transform property here,
    // because it will need to be used for animations.
    let tranlateX = this._reduceTranslateValues('translateX', this._translateX);
    let translateY = this._reduceTranslateValues('translateY', this._translateY);

    applyCssTransform(element, `${tranlateX} ${translateY}`);

    return Promise.resolve(null);
  }

  /** Reduce a list of translate values to a string that can be used in the transform property */
  private _reduceTranslateValues(translateFn: string, values: string[]) {
    return values.map(t => `${translateFn}(${t})`).join(' ');
  }
}

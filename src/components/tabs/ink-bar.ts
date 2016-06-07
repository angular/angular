import {Directive, Renderer, ElementRef} from '@angular/core';

/**
 * The ink-bar is used to display and animate the line underneath the current active tab label.
 * @internal
 */
@Directive({
  selector: 'md-ink-bar',
})
export class MdInkBar {
  constructor(private _renderer: Renderer, private _elementRef: ElementRef) {}

  /**
   * Calculates the styles from the provided element in order to align the ink-bar to that element.
   * @param element
   */
  alignToElement(element: HTMLElement) {
    this._renderer.setElementStyle(this._elementRef.nativeElement, 'left',
        this._getLeftPosition(element));
    this._renderer.setElementStyle(this._elementRef.nativeElement, 'width',
        this._getElementWidth(element));
  }

  /**
   * Generates the pixel distance from the left based on the provided element in string format.
   * @param element
   * @returns {string}
   */
  private _getLeftPosition(element: HTMLElement): string {
    return element ? element.offsetLeft + 'px' : '0';
  }

  /**
   * Generates the pixel width from the provided element in string format.
   * @param element
   * @returns {string}
   */
  private _getElementWidth(element: HTMLElement): string {
    return element ? element.offsetWidth + 'px' : '0';
  }
}

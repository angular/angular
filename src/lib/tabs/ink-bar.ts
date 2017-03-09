import {Directive, Renderer, ElementRef} from '@angular/core';


/**
 * The ink-bar is used to display and animate the line underneath the current active tab label.
 * @docs-private
 */
@Directive({
  selector: 'md-ink-bar, mat-ink-bar',
  host: {
    '[class.mat-ink-bar]': 'true',
  },
})
export class MdInkBar {
  constructor(private _renderer: Renderer, private _elementRef: ElementRef) {}

  /**
   * Calculates the styles from the provided element in order to align the ink-bar to that element.
   * Shows the ink bar if previously set as hidden.
   * @param element
   */
  alignToElement(element: HTMLElement) {
    this.show();
    this._renderer.setElementStyle(this._elementRef.nativeElement, 'left',
        this._getLeftPosition(element));
    this._renderer.setElementStyle(this._elementRef.nativeElement, 'width',
        this._getElementWidth(element));
  }

  /** Shows the ink bar. */
  show(): void {
    this._renderer.setElementStyle(this._elementRef.nativeElement, 'visibility', 'visible');
  }

  /** Hides the ink bar. */
  hide(): void {
    this._renderer.setElementStyle(this._elementRef.nativeElement, 'visibility', 'hidden');
  }

  /**
   * Generates the pixel distance from the left based on the provided element in string format.
   * @param element
   */
  private _getLeftPosition(element: HTMLElement): string {
    return element ? element.offsetLeft + 'px' : '0';
  }

  /**
   * Generates the pixel width from the provided element in string format.
   * @param element
   */
  private _getElementWidth(element: HTMLElement): string {
    return element ? element.offsetWidth + 'px' : '0';
  }
}

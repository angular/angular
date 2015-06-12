import {DOM} from 'angular2/src/dom/dom_adapter';
import {normalizeBlank} from 'angular2/src/facade/lang';
import {ViewRef} from './view_ref';
import {resolveInternalDomView} from 'angular2/src/render/dom/view/view';

/**
 * @exportedAs angular2/view
 */
export class ElementRef {
  constructor(public parentView: ViewRef, public boundElementIndex: number) {}

  /**
   * Exposes the underlying DOM element.
   * (DEPRECATED way of accessing the DOM, replacement coming)
   */
  // TODO(tbosch): Here we expose the real DOM element.
  // We need a more general way to read/write to the DOM element
  // via a proper abstraction in the render layer
  get domElement() {
    return resolveInternalDomView(this.parentView.render)
        .boundElements[this.boundElementIndex]
        .element;
  }

  /**
   * Gets an attribute from the underlying DOM element.
   * (DEPRECATED way of accessing the DOM, replacement coming)
   */
  // TODO(tbosch): Here we expose the real DOM element.
  // We need a more general way to read/write to the DOM element
  // via a proper abstraction in the render layer
  getAttribute(name: string): string {
    return normalizeBlank(DOM.getAttribute(this.domElement, name));
  }
}

import {DOM} from 'angular2/src/dom/dom_adapter';
import {normalizeBlank} from 'angular2/src/facade/lang';
import {ViewRef} from './view_ref';
import {DirectDomViewRef} from 'angular2/src/render/dom/direct_dom_renderer';

/**
 * @exportedAs angular2/view
 */
export class ElementRef {
  parentView:ViewRef;
  boundElementIndex:number;

  constructor(parentView:ViewRef, boundElementIndex:number) {
    this.parentView = parentView;
    this.boundElementIndex = boundElementIndex;
  }

  /**
   * Exposes the underlying DOM element.
   * (DEPRECATED way of accessing the DOM, replacement coming)
   */
  // TODO(tbosch): Here we expose the real DOM element.
  // We need a more general way to read/write to the DOM element
  // via a proper abstraction in the render layer
  get domElement() {
    var renderViewRef:DirectDomViewRef = this.parentView.render;
    return renderViewRef.delegate.boundElements[this.boundElementIndex];
  }

  /**
   * Gets an attribute from the underlying DOM element.
   * (DEPRECATED way of accessing the DOM, replacement coming)
   */
  // TODO(tbosch): Here we expose the real DOM element.
  // We need a more general way to read/write to the DOM element
  // via a proper abstraction in the render layer
  getAttribute(name:string):string {
    return normalizeBlank(DOM.getAttribute(this.domElement, name));
  }
}

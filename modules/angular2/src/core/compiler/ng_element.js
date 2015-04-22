import {DOM} from 'angular2/src/dom/dom_adapter';
import {normalizeBlank} from 'angular2/src/facade/lang';
import * as viewModule from '../compiler/view';
import {DirectDomViewRef} from 'angular2/src/render/dom/direct_dom_renderer';

/**
 * Allows direct access to the underlying DOM element.
 *
 * Attention: NgElement will be replaced by a different concept
 * for accessing an element in a way that is compatible with the render layer.
 *
 * @exportedAs angular2/core
 */
export class NgElement {
  _view:viewModule.AppView;
  _boundElementIndex:number;

  constructor(view, boundElementIndex) {
    this._view = view;
    this._boundElementIndex = boundElementIndex;
  }

  // TODO(tbosch): Here we expose the real DOM element.
  // We need a more general way to read/write to the DOM element
  // via a proper abstraction in the render layer
  get domElement() {
    var domViewRef:DirectDomViewRef = this._view.render;
    return domViewRef.delegate.boundElements[this._boundElementIndex];
  }

  getAttribute(name:string):string {
    return normalizeBlank(DOM.getAttribute(this.domElement, name));
  }
}

import {isPresent} from 'angular2/src/facade/lang';
import {MapWrapper} from 'angular2/src/facade/collection';
import {DOM} from 'angular2/src/dom/dom_adapter';

import {CompileStep} from './compile_step';
import {CompileElement} from './compile_element';
import {CompileControl} from './compile_control';

const NG_BINDING_CLASS = 'ng-binding';

/**
 * Marks elements that have bindings with a css class
 * and sets the CompileElement.hasBindings flag.
 *
 * Fills:
 * - CompileElement#hasBindings
 *
 * Reads:
 * - CompileElement#textNodeBindings
 * - CompileElement#propertyBindings
 * - CompileElement#variableBindings
 * - CompileElement#eventBindings
 * - CompileElement#decoratorDirectives
 * - CompileElement#componentDirective
 * - CompileElement#viewportDirective
 */
export class ElementBindingMarker extends CompileStep {
  process(parent:CompileElement, current:CompileElement, control:CompileControl) {
    if (current.ignoreBindings) {
      return;
    }

    var hasBindings =
      (isPresent(current.textNodeBindings) && MapWrapper.size(current.textNodeBindings)>0) ||
      (isPresent(current.propertyBindings) && MapWrapper.size(current.propertyBindings)>0) ||
      (isPresent(current.variableBindings) && MapWrapper.size(current.variableBindings)>0) ||
      (isPresent(current.eventBindings) && MapWrapper.size(current.eventBindings)>0) ||
      (isPresent(current.decoratorDirectives) && current.decoratorDirectives.length > 0) ||
      isPresent(current.viewportDirective) ||
      isPresent(current.componentDirective) || 
      isPresent(current.contentTagSelector);

    if (hasBindings) {
      var element = current.element;
      DOM.addClass(element, NG_BINDING_CLASS);
      current.hasBindings = true;
    }
  }
}

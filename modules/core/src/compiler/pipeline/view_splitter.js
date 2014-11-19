import {isBlank, isPresent} from 'facade/lang';
import {DOM, TemplateElement} from 'facade/dom';
import {MapWrapper, StringMapWrapper} from 'facade/collection';

import {Parser} from 'change_detection/parser/parser';

import {CompileStep} from './compile_step';
import {CompileElement} from './compile_element';
import {CompileControl} from './compile_control';

/**
 * Splits views at template directives:
 * Replaces the element with an empty <template> element that contains the
 * template directive and all property bindings needed for the template directive.
 *
 * Fills:
 * - CompileElement#isViewRoot
 * - CompileElement#variableBindings
 * - CompileElement#propertyBindings
 */
export class ViewSplitter extends CompileStep {
  constructor(parser:Parser) {
    this._parser = parser;
  }

  process(parent:CompileElement, current:CompileElement, control:CompileControl) {
    var element = current.element;
    if (isBlank(parent) || (current.element instanceof TemplateElement)) {
      current.isViewRoot = true;
    } else {
      var templateBindings = MapWrapper.get(current.attrs(), 'template');
      if (isPresent(templateBindings)) {
        current.isViewRoot = true;
        var templateElement = DOM.createTemplate('');
        var newParentElement = new CompileElement(templateElement);
        this._parseTemplateBindings(templateBindings, newParentElement);
        control.addParent(newParentElement);
      }
    }
  }

  _parseTemplateBindings(templateBindings:string, compileElement:CompileElement) {
    var bindings = this._parser.parseTemplateBindings(templateBindings);
    for (var i=0; i<bindings.length; i++) {
      var binding = bindings[i];
      if (isPresent(binding.name)) {
        compileElement.addVariableBinding(binding.key, binding.name);
      } else {
        compileElement.addPropertyBinding(binding.key, binding.expression);
      }
    }
  }
}

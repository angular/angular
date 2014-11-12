import {isBlank, isPresent} from 'facade/lang';
import {DOM} from 'facade/dom';
import {MapWrapper, StringMapWrapper} from 'facade/collection';

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
 *
 * Updates:
 * - CompileElement#templateDirective
 * - CompileElement#propertyBindings
 *
 * Reads:
 * - CompileElement#templateDirective
 * - CompileElement#propertyBindings
 */
export class ViewSplitter extends CompileStep {
  process(parent:CompileElement, current:CompileElement, control:CompileControl) {
    var element = current.element;
    if (isPresent(current.templateDirective)) {
      var templateElement = DOM.createTemplate('');
      var templateBoundProperties = MapWrapper.create();
      var nonTemplateBoundProperties = MapWrapper.create();
      this._splitElementPropertyBindings(current, templateBoundProperties, nonTemplateBoundProperties);

      var newParentElement = new CompileElement(templateElement);
      newParentElement.propertyBindings = templateBoundProperties;
      newParentElement.templateDirective = current.templateDirective;
      control.addParent(newParentElement);

      // disconnect child view from their parent view
      element.remove();

      current.templateDirective = null;
      current.propertyBindings = nonTemplateBoundProperties;
      current.isViewRoot = true;
    } else if (isBlank(parent)) {
      current.isViewRoot = true;
    }
  }

  _splitElementPropertyBindings(compileElement, templateBoundProperties, nonTemplateBoundProperties) {
    var dirBindings = compileElement.templateDirective.annotation.bind;
    if (isPresent(dirBindings) && isPresent(compileElement.propertyBindings)) {
      MapWrapper.forEach(compileElement.propertyBindings, (expr, elProp) => {
        if (isPresent(StringMapWrapper.get(dirBindings, elProp))) {
          MapWrapper.set(templateBoundProperties, elProp, expr);
        } else {
          MapWrapper.set(nonTemplateBoundProperties, elProp, expr);
        }
      });
    }
  }
}

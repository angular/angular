import {isPresent, BaseException} from 'facade/src/lang';
import {ListWrapper, MapWrapper} from 'facade/src/collection';

import {ProtoView} from '../view';
import {ChangeDetection} from 'change_detection/change_detection';

import {CompileStep} from './compile_step';
import {CompileElement} from './compile_element';
import {CompileControl} from './compile_control';

/**
 * Creates ProtoViews and forwards variable bindings from parent to children.
 *
 * Fills:
 * - (in parent): CompileElement#inheritedElementBinder.nestedProtoView
 * - CompileElement#inheritedProtoView
 *
 * Reads:
 * - (in parent): CompileElement#inheritedProtoView
 * - (in parent): CompileElement#variableBindings
 * - CompileElement#isViewRoot
 */
export class ProtoViewBuilder extends CompileStep {
  changeDetection:ChangeDetection;
  constructor(changeDetection:ChangeDetection) {
    this.changeDetection = changeDetection;
  }

  process(parent:CompileElement, current:CompileElement, control:CompileControl) {
    var inheritedProtoView = null;
    if (current.isViewRoot) {
      var protoChangeDetector = this.changeDetection.createProtoChangeDetector('dummy');
      inheritedProtoView = new ProtoView(current.element, protoChangeDetector);
      if (isPresent(parent)) {
        if (isPresent(parent.inheritedElementBinder.nestedProtoView)) {
          throw new BaseException('Only one nested view per element is allowed');
        }
        parent.inheritedElementBinder.nestedProtoView = inheritedProtoView;

        // When current is a view root, the variable bindings are set to the *nested* proto view.
        // The root view conceptually signifies a new "block scope" (the nested view), to which
        // the variables are bound.
        if (isPresent(parent.variableBindings)) {
          MapWrapper.forEach(parent.variableBindings, (mappedName, varName) => {
            inheritedProtoView.bindVariable(varName, mappedName);
          });
        }
      }
    } else if (isPresent(parent)) {
      inheritedProtoView = parent.inheritedProtoView;
    }

    // The view's contextWithLocals needs to have a full set of variable names at construction time
    // in order to prevent new variables from being set later in the lifecycle. Since we don't want
    // to actually create variable bindings for the $implicit bindings, add to the
    // protoContextLocals manually.
    if (isPresent(current.variableBindings)) {
      MapWrapper.forEach(current.variableBindings, (mappedName, varName) => {
        MapWrapper.set(inheritedProtoView.protoContextLocals, mappedName, null);
      });
    }

    current.inheritedProtoView = inheritedProtoView;
  }
}

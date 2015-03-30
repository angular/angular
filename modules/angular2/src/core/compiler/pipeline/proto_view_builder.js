import {isPresent, BaseException} from 'angular2/src/facade/lang';
import {ListWrapper, MapWrapper} from 'angular2/src/facade/collection';

import {ProtoView} from '../view';
import {ChangeDetection} from 'angular2/change_detection';

import {CompileStep} from './compile_step';
import {CompileElement} from './compile_element';
import {CompileControl} from './compile_control';
import {ShadowDomStrategy} from '../shadow_dom_strategy';
import {DirectiveMetadata} from '../directive_metadata';
import {Component} from 'angular2/src/core/annotations/annotations';

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
  _shadowDomStrategy:ShadowDomStrategy;
  _compiledComponent:DirectiveMetadata;

  constructor(compiledComponent:DirectiveMetadata,
              changeDetection:ChangeDetection, shadowDomStrategy:ShadowDomStrategy) {
    super();
    this._compiledComponent = compiledComponent;
    this._shadowDomStrategy = shadowDomStrategy;
    this.changeDetection = changeDetection;
  }

  process(parent:CompileElement, current:CompileElement, control:CompileControl) {
    var inheritedProtoView = null;
    if (current.isViewRoot) {
      var componentAnnotation:Component = this._compiledComponent.annotation;
      var protoChangeDetector = this.changeDetection.createProtoChangeDetector('dummy',
        componentAnnotation.changeDetection);

      inheritedProtoView = new ProtoView(current.element, protoChangeDetector,
        this._shadowDomStrategy, this._getParentProtoView(parent));

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

    // The view's locals needs to have a full set of variable names at construction time
    // in order to prevent new variables from being set later in the lifecycle. Since we don't want
    // to actually create variable bindings for the $implicit bindings, add to the
    // protoLocals manually.
    if (isPresent(current.variableBindings)) {
      MapWrapper.forEach(current.variableBindings, (mappedName, varName) => {
        MapWrapper.set(inheritedProtoView.protoLocals, mappedName, null);
      });
    }

    current.inheritedProtoView = inheritedProtoView;
  }

  _getParentProtoView(parent:CompileElement) {
    return isPresent(parent) ? parent.inheritedProtoView : null;
  }
}

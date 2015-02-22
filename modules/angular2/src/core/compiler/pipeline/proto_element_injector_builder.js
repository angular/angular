import {isPresent, isBlank} from 'angular2/src/facade/lang';
import {ListWrapper, MapWrapper} from 'angular2/src/facade/collection';

import {ProtoElementInjector, ComponentKeyMetaData, DirectiveBinding} from '../element_injector';

import {CompileStep} from './compile_step';
import {CompileElement} from './compile_element';
import {CompileControl} from './compile_control';
import {DirectiveMetadata} from '../directive_metadata';

/**
 * Creates the ProtoElementInjectors.
 *
 * Fills:
 * - CompileElement#inheritedProtoElementInjector
 * - CompileElement#distanceToParentInjector
 *
 * Reads:
 * - (in parent) CompileElement#inheritedProtoElementInjector
 * - (in parent) CompileElement#distanceToParentInjector
 * - CompileElement#isViewRoot
 * - CompileElement#inheritedProtoView
 * - CompileElement#decoratorDirectives
 * - CompileElement#componentDirective
 * - CompileElement#viewportDirective
 */
export class ProtoElementInjectorBuilder extends CompileStep {
  // public so that we can overwrite it in tests
  internalCreateProtoElementInjector(parent, index, directives, firstBindingIsComponent, distance) {
    return new ProtoElementInjector(parent, index, directives, firstBindingIsComponent, distance);
  }

  process(parent:CompileElement, current:CompileElement, control:CompileControl) {
    var distanceToParentInjector = this._getDistanceToParentInjector(parent, current);
    var parentProtoElementInjector = this._getParentProtoElementInjector(parent, current);
    var injectorBindings = ListWrapper.map(current.getAllDirectives(), this._createBinding);
    // TODO: add lightDomServices as well,
    // but after the directives as we rely on that order
    // in the element_binder_builder.

    // Create a protoElementInjector for any element that either has bindings *or* has one
    // or more var- defined. Elements with a var- defined need a their own element injector
    // so that, when hydrating, $implicit can be set to the element.
    if (injectorBindings.length > 0 || isPresent(current.variableBindings)) {
      var protoView = current.inheritedProtoView;
      var hasComponent = isPresent(current.componentDirective);

      current.inheritedProtoElementInjector = this.internalCreateProtoElementInjector(
        parentProtoElementInjector, protoView.elementBinders.length, injectorBindings,
        hasComponent, distanceToParentInjector
      );
      current.distanceToParentInjector = 0;

      // Viewport directives are treated differently than other element with var- definitions.
      if (isPresent(current.variableBindings) && !isPresent(current.viewportDirective)) {
        current.inheritedProtoElementInjector.exportComponent = hasComponent;
        current.inheritedProtoElementInjector.exportElement = !hasComponent;

        // experiment
        var exportImplicitName = MapWrapper.get(current.variableBindings, '\$implicit');
        if (isPresent(exportImplicitName)) {
          current.inheritedProtoElementInjector.exportImplicitName = exportImplicitName;
        }
      }

    } else {
      current.inheritedProtoElementInjector = parentProtoElementInjector;
      current.distanceToParentInjector = distanceToParentInjector;
    }
  }

  _getDistanceToParentInjector(parent, current) {
    return isPresent(parent) ? parent.distanceToParentInjector + 1 : 0;
  }

  _getParentProtoElementInjector(parent, current) {
    if (isPresent(parent) && !current.isViewRoot) {
      return parent.inheritedProtoElementInjector;
    }
    return null;
  }

  _createBinding(d:DirectiveMetadata): DirectiveBinding {
    return DirectiveBinding.createFromType(d.type, d.annotation);
  }
}

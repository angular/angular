import {isPresent, isBlank} from 'facade/lang';
import {ListWrapper} from 'facade/collection';

import {Key} from 'di/di';
import {ProtoElementInjector, ComponentKeyMetaData, DirectiveBinding} from '../element_injector';

import {CompileStep} from './compile_step';
import {CompileElement} from './compile_element';
import {CompileControl} from './compile_control';
import {DirectiveMetadata} from '../directive_metadata';

/**
 * Creates the ProtoElementInjectors.
 *
 * Fills:
 * - CompileElement#inheriteProtoElementInjector
 *
 * Reads:
 * - (in parent) CompileElement#inheriteProtoElementInjector
 * - CompileElement#isViewRoot
 * - CompileElement#inheritedProtoView
 * - CompileElement#decoratorDirectives
 * - CompileElement#componentDirective
 * - CompileElement#templateDirective
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

    if (injectorBindings.length > 0) {
      var protoView = current.inheritedProtoView;
      var hasComponent = isPresent(current.componentDirective);

      current.inheritedProtoElementInjector = this.internalCreateProtoElementInjector(
        parentProtoElementInjector, protoView.elementBinders.length, injectorBindings,
        hasComponent, distanceToParentInjector
      );
      current.distanceToParentInjector = 0;

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

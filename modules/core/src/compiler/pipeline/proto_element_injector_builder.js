import {isPresent, isBlank} from 'facade/lang';
import {ListWrapper} from 'facade/collection';

import {Key} from 'di/di';
import {ProtoElementInjector, ComponentKeyMetaData} from '../element_injector';

import {CompileStep} from './compile_step';
import {CompileElement} from './compile_element';
import {CompileControl} from './compile_control';

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
  internalCreateProtoElementInjector(parent, index, directives, firstBindingIsComponent) {
    return new ProtoElementInjector(parent, index, directives, firstBindingIsComponent);
  }

  process(parent:CompileElement, current:CompileElement, control:CompileControl) {
    var inheritedProtoElementInjector = null;
    var parentProtoElementInjector = this._getParentProtoElementInjector(parent, current);
    var injectorBindings = this._collectDirectiveBindings(current);
    // TODO: add lightDomServices as well,
    // but after the directives as we rely on that order
    // in the element_binder_builder.

    if (injectorBindings.length > 0) {
      var protoView = current.inheritedProtoView;
      var hasComponent = isPresent(current.componentDirective);
      inheritedProtoElementInjector = this.internalCreateProtoElementInjector(
        parentProtoElementInjector, protoView.elementBinders.length, injectorBindings, hasComponent
      );
    } else {
      inheritedProtoElementInjector = parentProtoElementInjector;
    }
    current.inheritedProtoElementInjector = inheritedProtoElementInjector;
  }

  _getParentProtoElementInjector(parent, current) {
    if (isPresent(parent) && !current.isViewRoot) {
      return parent.inheritedProtoElementInjector;
    }
    return null;
  }

  _collectDirectiveBindings(pipelineElement) {
    var directiveTypes = [];
    if (isPresent(pipelineElement.componentDirective)) {
      ListWrapper.push(directiveTypes, pipelineElement.componentDirective.type);
    }
    if (isPresent(pipelineElement.templateDirective)) {
      ListWrapper.push(directiveTypes, pipelineElement.templateDirective.type);
    }
    if (isPresent(pipelineElement.decoratorDirectives)) {
      for (var i=0; i<pipelineElement.decoratorDirectives.length; i++) {
        ListWrapper.push(directiveTypes, pipelineElement.decoratorDirectives[i].type);
      }
    }
    return directiveTypes;
  }
}

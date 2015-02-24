import {CompileStep} from './compile_step';
import {CompileElement} from './compile_element';
import {CompileControl} from './compile_control';

import {isPresent, Type} from 'angular2/src/facade/lang';

import {DirectiveMetadata} from 'angular2/src/core/compiler/directive_metadata';
import {ShadowDomStrategy} from 'angular2/src/core/compiler/shadow_dom_strategy';

export class ShimShadowDom extends CompileStep {
  _strategy: ShadowDomStrategy;
  _component: Type;

  constructor(cmpMetadata: DirectiveMetadata, strategy: ShadowDomStrategy) {
    super();
    this._strategy = strategy;
    this._component = cmpMetadata.type;
  }

  process(parent:CompileElement, current:CompileElement, control:CompileControl) {
    if (current.ignoreBindings) {
      return;
    }

    // Shim the element as a child of the compiled component
    this._strategy.shimContentElement(this._component, current.element);

    // If the current element is also a component, shim it as a host
    var host = current.componentDirective;
    if (isPresent(host)) {
      this._strategy.shimHostElement(host.type, current.element);
    }
  }
}


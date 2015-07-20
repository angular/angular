import {CompileStep} from '../compiler/compile_step';
import {CompileElement} from '../compiler/compile_element';
import {CompileControl} from '../compiler/compile_control';
import {ViewDefinition} from '../../api';
import {ShadowDomStrategy} from './shadow_dom_strategy';
import {NG_CONTENT_ELEMENT_NAME, isElementWithTag} from '../util';

export class ShadowDomCompileStep implements CompileStep {
  constructor(public _shadowDomStrategy: ShadowDomStrategy, public _view: ViewDefinition) {}

  process(parent: CompileElement, current: CompileElement, control: CompileControl) {
    if (isElementWithTag(current.element, NG_CONTENT_ELEMENT_NAME)) {
      current.inheritedProtoView.bindNgContent();
    } else if (isElementWithTag(current.element, 'style')) {
      this._processStyleElement(current, control);
    } else {
      var componentId = current.isBound() ? current.inheritedElementBinder.componentId : null;
      this._shadowDomStrategy.processElement(this._view.componentId, componentId, current.element);
    }
  }

  _processStyleElement(current: CompileElement, control: CompileControl) {
    this._shadowDomStrategy.processStyleElement(this._view.componentId, this._view.templateAbsUrl,
                                                current.element);

    // Style elements should not be further processed by the compiler, as they can not contain
    // bindings. Skipping further compiler steps allow speeding up the compilation process.
    control.ignoreCurrentElement();
  }
}

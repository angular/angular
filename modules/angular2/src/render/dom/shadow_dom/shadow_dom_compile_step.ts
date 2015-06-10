import {isBlank, isPresent, assertionsEnabled} from 'angular2/src/facade/lang';
import {MapWrapper, List, ListWrapper} from 'angular2/src/facade/collection';
import {Promise, PromiseWrapper} from 'angular2/src/facade/async';

import {DOM} from 'angular2/src/dom/dom_adapter';

import {CompileStep} from '../compiler/compile_step';
import {CompileElement} from '../compiler/compile_element';
import {CompileControl} from '../compiler/compile_control';
import {ViewDefinition} from '../../api';
import {ShadowDomStrategy} from './shadow_dom_strategy';

export class ShadowDomCompileStep implements CompileStep {
  constructor(public _shadowDomStrategy: ShadowDomStrategy, public _template: ViewDefinition,
              public _subTaskPromises: List<Promise<any>>) {}

  process(parent: CompileElement, current: CompileElement, control: CompileControl) {
    var tagName = DOM.tagName(current.element).toUpperCase();
    if (tagName == 'STYLE') {
      this._processStyleElement(current, control);
    } else if (tagName == 'CONTENT') {
      this._processContentElement(current);
    } else {
      var componentId = current.isBound() ? current.inheritedElementBinder.componentId : null;
      this._shadowDomStrategy.processElement(this._template.componentId, componentId,
                                             current.element);
    }
  }

  _processStyleElement(current: CompileElement, control: CompileControl) {
    var stylePromise = this._shadowDomStrategy.processStyleElement(
        this._template.componentId, this._template.templateAbsUrl, current.element);
    if (isPresent(stylePromise) && PromiseWrapper.isPromise(stylePromise)) {
      ListWrapper.push(this._subTaskPromises, stylePromise);
    }

    // Style elements should not be further processed by the compiler, as they can not contain
    // bindings. Skipping further compiler steps allow speeding up the compilation process.
    control.ignoreCurrentElement();
  }

  _processContentElement(current: CompileElement) {
    if (this._shadowDomStrategy.hasNativeContentElement()) {
      return;
    }
    var attrs = current.attrs();
    var selector = MapWrapper.get(attrs, 'select');
    selector = isPresent(selector) ? selector : '';

    var contentStart = DOM.createScriptTag('type', 'ng/contentStart');
    if (assertionsEnabled()) {
      DOM.setAttribute(contentStart, 'select', selector);
    }
    var contentEnd = DOM.createScriptTag('type', 'ng/contentEnd');
    DOM.insertBefore(current.element, contentStart);
    DOM.insertBefore(current.element, contentEnd);
    DOM.remove(current.element);

    current.element = contentStart;
    current.bindElement().setContentTagSelector(selector);
  }
}

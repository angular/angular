import {CompileStep} from './compile_step';
import {CompileElement} from './compile_element';
import {CompileControl} from './compile_control';

import {DirectiveMetadata} from 'angular2/src/core/compiler/directive_metadata';
import {ShadowDomStrategy} from 'angular2/src/core/compiler/shadow_dom_strategy';

import {DOM} from 'angular2/src/dom/dom_adapter';
import {Type} from 'angular2/src/facade/lang';
import {PromiseWrapper} from 'angular2/src/facade/async';
import {ListWrapper} from 'angular2/src/facade/collection';

export class ResolveCss extends CompileStep {
  _strategy: ShadowDomStrategy;
  _component: Type;
  _templateUrl: string;

  constructor(cmpMetadata: DirectiveMetadata, strategy: ShadowDomStrategy, templateUrl: string) {
    super();
    this._strategy = strategy;
    this._component = cmpMetadata.type;
    this._templateUrl = templateUrl;
  }

  process(parent:CompileElement, current:CompileElement, control:CompileControl) {
    // May be remove the styles
    if (DOM.tagName(current.element) == 'STYLE') {
      current.ignoreBindings = true;
      var styleEl = current.element;

      var css = DOM.getText(styleEl);
      css = this._strategy.transformStyleText(css, this._templateUrl, this._component);
      if (PromiseWrapper.isPromise(css)) {
        ListWrapper.push(parent.inheritedProtoView.stylePromises, css);
        DOM.setText(styleEl, '');
        css.then((css) => {
          DOM.setText(styleEl, css);
        })
      } else {
        DOM.setText(styleEl, css);
      }

      this._strategy.handleStyleElement(styleEl);
    }
  }
}


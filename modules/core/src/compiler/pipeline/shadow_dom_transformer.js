import {CompileStep} from './compile_step';
import {CompileElement} from './compile_element';
import {CompileControl} from './compile_control';

import {DirectiveMetadata} from 'core/src/compiler/directive_metadata';
import {ShadowDomStrategy} from 'core/src/compiler/shadow_dom_strategy';
import {shimCssText} from 'core/src/compiler/shadow_dom_emulation/shim_css';

import {DOM, Element} from 'facade/src/dom';
import {isPresent, isBlank} from 'facade/src/lang';

export class ShadowDomTransformer extends CompileStep {
  _selector: string;
  _strategy: ShadowDomStrategy;
  _styleHost: Element;
  _lastInsertedStyle: Element;

  constructor(cmpMetadata: DirectiveMetadata, strategy: ShadowDomStrategy,
              styleHost: Element = null) {
    this._strategy = strategy;
    this._selector = cmpMetadata.annotation.selector;
    if (isBlank(styleHost)) {
      styleHost = DOM.defaultDoc().head;
    }
    this._styleHost = styleHost;
    this._lastInsertedStyle = null;
  }

  process(parent:CompileElement, current:CompileElement, control:CompileControl) {
    // May be remove the styles
    if (DOM.tagName(current.element) == 'STYLE') {
      current.ignoreBindings = true;
      if (this._strategy.extractStyles()) {
        DOM.remove(current.element);
        var css = DOM.getText(current.element);
        if (this._strategy.shim()) {
          css = shimCssText(css, this._selector);
        }
        this._insertStyle(this._styleHost, css);
      }
    } else {
      if (this._strategy.shim()) {
        DOM.setAttribute(current.element, this._selector, '');
      }
    }
  }

  _insertStyle(el: Element, css: string) {
    var style = DOM.createStyleElement(css);
    if (isBlank(this._lastInsertedStyle)) {
      var firstChild = DOM.firstChild(el);
      if (isPresent(firstChild)) {
        DOM.insertBefore(firstChild, style);
      } else {
        DOM.appendChild(el, style);
      }
    } else {
      DOM.insertAfter(this._lastInsertedStyle, style);
    }
    this._lastInsertedStyle = style;
  }
}


import {CompileStep} from './compile_step';
import {CompileElement} from './compile_element';
import {CompileControl} from './compile_control';

import {DirectiveMetadata} from 'angular2/src/core/compiler/directive_metadata';
import {ShadowDomStrategy} from 'angular2/src/core/compiler/shadow_dom_strategy';
import {shimCssText} from 'angular2/src/core/compiler/shadow_dom_emulation/shim_css';

import {DOM, Element} from 'angular2/src/facade/dom';
import {isPresent, isBlank} from 'angular2/src/facade/lang';
import {StringMapWrapper} from 'angular2/src/facade/collection';

var _cssCache = StringMapWrapper.create();

export class ShadowDomTransformer extends CompileStep {
  _selector: string;
  _strategy: ShadowDomStrategy;
  _styleHost: Element;
  _lastInsertedStyle: Element;

  constructor(cmpMetadata: DirectiveMetadata, strategy: ShadowDomStrategy, styleHost: Element) {
    super();
    this._strategy = strategy;
    this._selector = cmpMetadata.annotation.selector;
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
          // The css generated here is unique for the component (because of the shim).
          // Then we do not need to cache it.
          css = shimCssText(css, this._selector);
          this._insertStyle(this._styleHost, css);
        } else {
          var seen = isPresent(StringMapWrapper.get(_cssCache, css));
          if (!seen) {
            StringMapWrapper.set(_cssCache, css, true);
            this._insertStyle(this._styleHost, css);
          }
        }
      }
    } else {
      if (this._strategy.shim()) {
        try {
          DOM.setAttribute(current.element, this._selector, '');
        } catch(e) {
          // TODO(vicb): for now only simple selector (tag name) are supported
        }
      }
    }
  }

  clearCache() {
    _cssCache = StringMapWrapper.create();
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


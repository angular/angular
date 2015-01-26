import {JS} from 'facade/js_interop';
import {TemplateElement, StyleElement, DOM} from 'facade/dom';
import {BaseException, isPresent} from 'facade/lang';

import {DirectiveMetadata} from '../directive_metadata';
import {ShadowDomEmulated, ShadowDomNative} from '../shadow_dom';
import {WebComponentPolyfill} from './webcmp_polyfill';

export class ShadowDomTransformer {
  _polyfill: WebComponentPolyfill;

  constructor(polyfill: WebComponentPolyfill) {
    this._polyfill = polyfill;
  }

  transformTemplate(template: TemplateElement, cmpMetadata: DirectiveMetadata): TemplateElement {
    if (cmpMetadata.shadowDomStrategy === ShadowDomNative) {
      if (this._polyfill.isEnabled()) {
        var selector = cmpMetadata.annotation.selector;
        this._addAttributeToChildren(template, selector);
      }
      return template;
    }

    if (cmpMetadata.shadowDomStrategy === ShadowDomEmulated) {
      var selector = cmpMetadata.annotation.selector;
      this._addAttributeToChildren(template, selector);
      return template;
    }

    throw new BaseException(`Unsupported shadow DOM strategy: ${cmpMetadata.shadowDomStrategy}`);
  }

  transformStyle(style: StyleElement, cmpMetadata: DirectiveMetadata): StyleElement {
    if (cmpMetadata.shadowDomStrategy === ShadowDomNative) {
      if (this._polyfill.isEnabled()) {
        // todo(vicb): use the polyfill to transform the CSS
      }
      return style;
    }

    if (cmpMetadata.shadowDomStrategy === ShadowDomEmulated) {
      var selector = cmpMetadata.annotation.selector;
      // todo(vicb): use the CSS compiler to transform the CSS
      return style;
    }

    throw new BaseException(`Unsupported shadow DOM strategy: ${cmpMetadata.shadowDomStrategy}`);
  }

  _addAttributeToChildren(template: TemplateElement, attrName:string) {
    // todo(vicb): currently the code crashes when the attrName is not an el selector
    var children = DOM.querySelectorAll(template.content, "*");
    for (var i = 0; i < children.length; i++) {
      var child = children[i];
      DOM.setAttribute(child, attrName, '');
    }
  }
}



import {CONST} from 'facade/lang';
import {DOM, Element} from 'facade/dom';
import {List} from 'facade/collection';
import {View} from './view';
import {Content} from './shadow_dom_emulation/content_tag';
import {LightDom} from './shadow_dom_emulation/light_dom';
import {WebComponentPolyfill} from './shadow_dom_emulation/webcmp_polyfill';
import {ShadowBoundary} from './shadow_boundary';

export class ShadowDomStrategy {
  @CONST() constructor() {}
  attachTemplate(el:Element, view:View){}
  constructLightDom(lightDomView:View, shadowDomView:View, el:Element){}
  polyfillDirectives():List<Type>{ return null; }
  getShadowBoundary(el:Element, polyfill: WebComponentPolyfill):ShadowBoundary { return null; }
}

export class EmulatedShadowDomStrategy extends ShadowDomStrategy {
  @CONST() constructor() {}
  attachTemplate(el:Element, view:View){
    DOM.clearNodes(el);
    moveViewNodesIntoParent(el, view);
  }

  constructLightDom(lightDomView:View, shadowDomView:View, el:Element){
    return new LightDom(lightDomView, shadowDomView, el);
  }

  polyfillDirectives():List<Type> {
    return [Content];
  }

  getShadowBoundary(el:Element, polyfill: WebComponentPolyfill):ShadowBoundary {
    return null;
  }
}

export class NativeShadowDomStrategy extends ShadowDomStrategy {
  @CONST() constructor() {}
  attachTemplate(el:Element, view:View){
    moveViewNodesIntoParent(DOM.createShadowRoot(el), view);
  }

  constructLightDom(lightDomView:View, shadowDomView:View, el:Element){
    return null;
  }

  polyfillDirectives():List<Type> {
    return [];
  }

  getShadowBoundary(el:Element, polyfill: WebComponentPolyfill):ShadowBoundary {
    if (polyfill.isEnabled()) {
      return null;
    } else {
      var root = DOM.getShadowRoot(el);
      return new ShadowBoundary(root);
    }
  }
}

function moveViewNodesIntoParent(parent, view) {
  for (var i = 0; i < view.nodes.length; ++i) {
    DOM.appendChild(parent, view.nodes[i]);
  }
}

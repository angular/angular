import {CONST} from 'facade/lang';
import {DOM, Element} from 'facade/dom';
import {List} from 'facade/collection';
import {View} from './view';
import {Content} from './shadow_dom_emulation/content_tag';
import {LightDom} from './shadow_dom_emulation/light_dom';

export class ShadowDomStrategy {
  @CONST() constructor() {}
  attachTemplate(el:Element, view:View){}
  constructLightDom(lightDomView:View, shadowDomView:View, el:Element){}
  polyfillDirectives():List<Type>{ return null; };
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
}

export class NativeShadowDomStrategy extends ShadowDomStrategy {
  @CONST() constructor() {}
  attachTemplate(el:Element, view:View){
    moveViewNodesIntoParent(el.createShadowRoot(), view);
  }

  constructLightDom(lightDomView:View, shadowDomView:View, el:Element){
    return null;
  }

  polyfillDirectives():List<Type> {
    return [];
  }
}

function moveViewNodesIntoParent(parent, view) {
  for (var i = 0; i < view.nodes.length; ++i) {
    DOM.appendChild(parent, view.nodes[i]);
  }
}
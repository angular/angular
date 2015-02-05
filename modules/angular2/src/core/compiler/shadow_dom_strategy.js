import {Type, isBlank, isPresent} from 'angular2/src/facade/lang';
import {DOM, Element} from 'angular2/src/facade/dom';
import {List, ListWrapper} from 'angular2/src/facade/collection';
import {View} from './view';
import {Content} from './shadow_dom_emulation/content_tag';
import {LightDom} from './shadow_dom_emulation/light_dom';
import {DirectiveMetadata} from './directive_metadata';

export class ShadowDomStrategy {
  attachTemplate(el:Element, view:View){}
  constructLightDom(lightDomView:View, shadowDomView:View, el:Element){}
  polyfillDirectives():List<Type>{ return null; }
  shim(): boolean { return false; }
  extractStyles(): boolean { return false; }
}

export class EmulatedShadowDomStrategy extends ShadowDomStrategy {
  constructor() {
    super();
  }

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

  shim(): boolean {
    return true;
  }

  extractStyles(): boolean {
    return true;
  }
}

export class NativeShadowDomStrategy extends ShadowDomStrategy {
  constructor() {
    super();
  }

  attachTemplate(el:Element, view:View){
    moveViewNodesIntoParent(el.createShadowRoot(), view);
  }

  constructLightDom(lightDomView:View, shadowDomView:View, el:Element){
    return null;
  }

  polyfillDirectives():List<Type> {
    return [];
  }

  shim(): boolean {
    return false;
  }

  extractStyles(): boolean {
    return false;
  }
}

function moveViewNodesIntoParent(parent, view) {
  for (var i = 0; i < view.nodes.length; ++i) {
    DOM.appendChild(parent, view.nodes[i]);
  }
}

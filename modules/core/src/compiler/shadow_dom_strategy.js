import {CONST} from 'facade/lang';
import {DOM} from 'facade/dom';
import {Element} from 'facade/dom';
import {View} from './view';

export class ShadowDomStrategy {
  @CONST() constructor() {}
  attachTemplate(el:Element, view:View){}
}

export class EmulatedShadowDomStrategy extends ShadowDomStrategy {
  @CONST() constructor() {}
  attachTemplate(el:Element, view:View){
    DOM.clearNodes(el);
    moveViewNodesIntoParent(el, view);
  }
}

export class NativeShadowDomStrategy extends ShadowDomStrategy {
  @CONST() constructor() {}
  attachTemplate(el:Element, view:View){
    moveViewNodesIntoParent(el.createShadowRoot(), view);
  }
}

function moveViewNodesIntoParent(parent, view) {
  for (var i = 0; i < view.nodes.length; ++i) {
    DOM.appendChild(parent, view.nodes[i]);
  }
}
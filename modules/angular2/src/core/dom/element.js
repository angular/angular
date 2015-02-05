import {DOM, Element} from 'facade/src/dom';
import {normalizeBlank} from 'facade/src/lang';

export class NgElement {
  domElement:Element;
  constructor(domElement:Element) {
    this.domElement = domElement;
  }

  getAttribute(name:string) {
    return normalizeBlank(DOM.getAttribute(this.domElement, name));
  }
}
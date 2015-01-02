import {DOM, Element} from 'facade/dom';
import {normalizeBlank} from 'facade/lang';

export class NgElement {
  domElement:Element;
  constructor(domElement:Element) {
    this.domElement = domElement;
  }

  getAttribute(name:string) {
    return normalizeBlank(DOM.getAttribute(this.domElement, name));
  }
}
import {DOM, Element} from 'angular2/src/facade/dom';
import {normalizeBlank} from 'angular2/src/facade/lang';

export class NgElement {
  domElement:Element;
  constructor(domElement:Element) {
    this.domElement = domElement;
  }

  getAttribute(name:string) {
    return normalizeBlank(DOM.getAttribute(this.domElement, name));
  }
}
import {Element} from 'facade/dom';

export class NgElement {
  domElement:Element;
  constructor(domElement:Element) {
    this.domElement = domElement;
  }
}
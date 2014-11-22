import {Element} from 'facade/dom';

export class NgElement {
  domElement:Element;
  constructor(domElement) {
    this.domElement = domElement;
  }
}
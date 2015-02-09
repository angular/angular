import {Decorator} from 'angular2/src/core/annotations/annotations';
import {NgElement} from 'angular2/src/core/dom/element';
import {isBlank} from 'angular2/src/facade/lang';

@Decorator({
  selector: '[autofocus]',
  bind: {
    'autofocus': 'condition'
  }
})
export class Autofocus {
  element:NgElement;
  prevCondition: boolean;

  constructor(el: NgElement) {
    this.element = el;
    this.prevCondition = null;
  }
  set condition(newCondition) {
    if (this.element.domElement.autofocus) {
      this.element.domElement.focus();
    }
    else {
      if (newCondition && (isBlank(this.prevCondition) || !this.prevCondition)) {
        this.prevCondition = true;
        this.element.domElement.focus();
      } else {
        this.prevCondition = false;
      }
    }
    return newCondition;
  }
}

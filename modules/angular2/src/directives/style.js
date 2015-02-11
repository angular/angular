import {Decorator} from 'angular2/src/core/annotations/annotations';
import {NgElement} from 'angular2/src/core/dom/element';
import {isBlank} from 'angular2/src/facade/lang';

@Decorator({
  selector: '[style]',
  bind: {
    'style': 'condition'
  }
})
export class Style {
  element:NgElement;
  constructor(el: NgElement) {
    this.element = el;
  }
  set condition(value) {
    if (value) {
      this.extendStyles(value);
    }
    return value;
  }
  objectToCss(object) {
    var css = '';
    for (var key in object) {
      css += ''+ key +':'+ object[key] +';';
    };
    return css;
  }
  extendStyles(styles) {
    var dom = this.element.domElement.style;
    for (var key in styles) {
      if (key in dom) {
        dom[key] = styles[key];
      }
    }
    return dom;
  }
}

import {DOM, document, location} from 'angular2/src/facade/dom';
import {NumberWrapper, BaseException, isBlank} from 'angular2/src/facade/lang';

export function getIntParameter(name:string) {
  return NumberWrapper.parseInt(getStringParameter(name), 10);
}

export function getStringParameter(name:string) {
  var els = DOM.querySelectorAll(document, `input[name="${name}"]`)
  var value;
  var el;

  for (var i=0; i<els.length; i++) {
    el = els[i];
    var type = DOM.type(el);
    if ((type !== 'radio' && type !== 'checkbox') || DOM.getChecked(el)) {
      value = DOM.getValue(el);
      break;
    }
  }

  if (isBlank(value)) {
    throw new BaseException(`Could not find and input field with name ${name}`);
  }

  return value;
}

export function bindAction(selector:string, callback:Function) {
  var el = DOM.querySelector(document, selector);
  DOM.on(el, 'click', function(_) {
    callback();
  });
}
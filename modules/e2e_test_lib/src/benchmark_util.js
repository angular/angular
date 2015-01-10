import {DOM, document, location} from 'facade/dom';
import {NumberWrapper, BaseException, isBlank} from 'facade/lang';

export function getIntParameter(name:string) {
  var el = DOM.querySelector(document, `input[name="${name}"]`);
  if (isBlank(el)) {
    throw new BaseException(`Could not find and input field with name ${name}`);
  }
  return NumberWrapper.parseInt(el.value, 10);
}

export function bindAction(selector:string, callback:Function) {
  var el = DOM.querySelector(document, selector);
  DOM.on(el, 'click', function(_) {
    callback();
  });
}
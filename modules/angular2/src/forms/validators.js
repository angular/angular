import {isBlank, isPresent} from 'angular2/src/facade/lang';
import {List, ListWrapper, StringMapWrapper} from 'angular2/src/facade/collection';

import {ControlGroup, Control} from 'angular2/forms';

export function required(c:Control) {
  return isBlank(c.value) || c.value == "" ? {"required" : true} : null;
}

export function nullValidator(c:Control) {
  return null;
}

export function compose(validators:List<Function>):Function {
  return function(c:Control) {
    var res = ListWrapper.reduce(validators, (res, validator) => {
      var errors = validator(c);
      return isPresent(errors) ? StringMapWrapper.merge(res, errors) : res;
    }, {});
    return StringMapWrapper.isEmpty(res) ? null : res;
  }
}

export function controlGroupValidator(c:ControlGroup) {
  var res = {};
  StringMapWrapper.forEach(c.controls, (control, name) => {
    if (control.active && isPresent(control.errors)) {
      res[name] = control.errors;
    }
  });
  return StringMapWrapper.isEmpty(res) ? null : res;
}

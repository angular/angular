import {isBlank, isPresent} from 'angular2/src/facade/lang';
import {List, ListWrapper, StringMapWrapper} from 'angular2/src/facade/collection';

import * as modelModule from './model';

export class Validators {
  static required(c:modelModule.Control) {
    return isBlank(c.value) || c.value == "" ? {"required": true} : null;
  }

  static nullValidator(c:modelModule.Control) {
    return null;
  }

  static compose(validators:List<Function>):Function {
    return function (c:modelModule.Control) {
      var res = ListWrapper.reduce(validators, (res, validator) => {
        var errors = validator(c);
        return isPresent(errors) ? StringMapWrapper.merge(res, errors) : res;
      }, {});
      return StringMapWrapper.isEmpty(res) ? null : res;
    }
  }

  static group(c:modelModule.ControlGroup) {
    var res = {};
    StringMapWrapper.forEach(c.controls, (control, name) => {
      if (c.contains(name) && isPresent(control.errors)) {
        StringMapWrapper.forEach(control.errors, (value, error) => {
          if (!StringMapWrapper.contains(res, error)) {
            res[error] = [];
          }
          ListWrapper.push(res[error], control);
        });
      }
    });
    return StringMapWrapper.isEmpty(res) ? null : res;
  }
}

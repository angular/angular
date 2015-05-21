import {isBlank, isPresent} from 'angular2/src/facade/lang';
import {List, ListWrapper, StringMapWrapper} from 'angular2/src/facade/collection';

import * as modelModule from './model';

/**
 * Provides a set of validators used by form controls.
 *
 * # Example
 *
 * ```
 * var loginControl = new Control("", Validators.required)
 * ```
 *
 * @exportedAs angular2/forms
 */
export class Validators {
  static required(c: modelModule.Control): StringMap<string, boolean> {
    return isBlank(c.value) || c.value == "" ? {"required": true} : null;
  }

  static nullValidator(c: any): StringMap<string, boolean> { return null; }

  static compose(validators: List<Function>): Function {
    return function(c: modelModule.Control) {
      var res = ListWrapper.reduce(validators, (res, validator) => {
        var errors = validator(c);
        return isPresent(errors) ? StringMapWrapper.merge(res, errors) : res;
      }, {});
      return StringMapWrapper.isEmpty(res) ? null : res;
    }
  }

  static group(c: modelModule.ControlGroup): StringMap<string, boolean> {
    var res = {};
    StringMapWrapper.forEach(c.controls, (control, name) => {
      if (c.contains(name) && isPresent(control.errors)) {
        Validators._mergeErrors(control, res);
      }
    });
    return StringMapWrapper.isEmpty(res) ? null : res;
  }

  static array(c: modelModule.ControlArray): StringMap<string, boolean> {
    var res = {};
    ListWrapper.forEach(c.controls, (control) => {
      if (isPresent(control.errors)) {
        Validators._mergeErrors(control, res);
      }
    });
    return StringMapWrapper.isEmpty(res) ? null : res;
  }

  static _mergeErrors(control: modelModule.AbstractControl, res: StringMap<string, any>): void {
    StringMapWrapper.forEach(control.errors, (value, error) => {
      if (!StringMapWrapper.contains(res, error)) {
        res[error] = [];
      }
      ListWrapper.push(res[error], control);
    });
  }
}

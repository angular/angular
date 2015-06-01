import {ListWrapper} from 'angular2/src/facade/collection';
import {isBlank, BaseException} from 'angular2/src/facade/lang';

import {ControlContainerDirective} from './control_container_directive';
import {ControlDirective} from './control_directive';
import {Control} from '../model';
import {Validators} from '../validators';

export function controlPath(name, parent: ControlContainerDirective) {
  var p = ListWrapper.clone(parent.path);
  ListWrapper.push(p, name);
  return p;
}

export function setUpControl(c: Control, dir: ControlDirective) {
  if (isBlank(c)) _throwError(dir, "Cannot find control");
  if (isBlank(dir.valueAccessor)) _throwError(dir, "No value accessor for");

  c.validator = Validators.compose([c.validator, dir.validator]);
  dir.valueAccessor.writeValue(c.value);

  // view -> model
  dir.valueAccessor.registerOnChange(newValue => {
    dir.viewToModelUpdate(newValue);
    c.updateValue(newValue);
  });

  // model -> view
  c.registerOnChange(newValue => dir.valueAccessor.writeValue(newValue));
}

function _throwError(dir: ControlDirective, message: string): void {
  var path = ListWrapper.join(dir.path, " -> ");
  throw new BaseException(`${message} '${path}'`);
}
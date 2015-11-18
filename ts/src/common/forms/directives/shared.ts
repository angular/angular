import {ListWrapper, StringMapWrapper} from 'angular2/src/facade/collection';
import {isBlank, isPresent, looseIdentical} from 'angular2/src/facade/lang';
import {BaseException, WrappedException} from 'angular2/src/facade/exceptions';

import {ControlContainer} from './control_container';
import {NgControl} from './ng_control';
import {AbstractControlDirective} from './abstract_control_directive';
import {NgControlGroup} from './ng_control_group';
import {Control, ControlGroup} from '../model';
import {Validators} from '../validators';
import {ControlValueAccessor} from './control_value_accessor';
import {DefaultValueAccessor} from './default_value_accessor';
import {NumberValueAccessor} from './number_value_accessor';
import {CheckboxControlValueAccessor} from './checkbox_value_accessor';
import {SelectControlValueAccessor} from './select_control_value_accessor';
import {normalizeValidator} from './normalize_validator';


export function controlPath(name: string, parent: ControlContainer): string[] {
  var p = ListWrapper.clone(parent.path);
  p.push(name);
  return p;
}

export function setUpControl(control: Control, dir: NgControl): void {
  if (isBlank(control)) _throwError(dir, "Cannot find control");
  if (isBlank(dir.valueAccessor)) _throwError(dir, "No value accessor for");

  control.validator = Validators.compose([control.validator, dir.validator]);
  control.asyncValidator = Validators.composeAsync([control.asyncValidator, dir.asyncValidator]);
  dir.valueAccessor.writeValue(control.value);

  // view -> model
  dir.valueAccessor.registerOnChange(newValue => {
    dir.viewToModelUpdate(newValue);
    control.updateValue(newValue, {emitModelToViewChange: false});
    control.markAsDirty();
  });

  // model -> view
  control.registerOnChange(newValue => dir.valueAccessor.writeValue(newValue));

  // touched
  dir.valueAccessor.registerOnTouched(() => control.markAsTouched());
}

export function setUpControlGroup(control: ControlGroup, dir: NgControlGroup) {
  if (isBlank(control)) _throwError(dir, "Cannot find control");
  control.validator = Validators.compose([control.validator, dir.validator]);
  control.asyncValidator = Validators.composeAsync([control.asyncValidator, dir.asyncValidator]);
}

function _throwError(dir: AbstractControlDirective, message: string): void {
  var path = dir.path.join(" -> ");
  throw new BaseException(`${message} '${path}'`);
}

export function composeValidators(validators: /* Array<Validator|Function> */ any[]): Function {
  return isPresent(validators) ? Validators.compose(validators.map(normalizeValidator)) : null;
}

export function composeAsyncValidators(
    validators: /* Array<Validator|Function> */ any[]): Function {
  return isPresent(validators) ? Validators.composeAsync(validators.map(normalizeValidator)) : null;
}

export function isPropertyUpdated(changes: {[key: string]: any}, viewModel: any): boolean {
  if (!StringMapWrapper.contains(changes, "model")) return false;
  var change = changes["model"];

  if (change.isFirstChange()) return true;
  return !looseIdentical(viewModel, change.currentValue);
}

// TODO: vsavkin remove it once https://github.com/angular/angular/issues/3011 is implemented
export function selectValueAccessor(dir: NgControl,
                                    valueAccessors: ControlValueAccessor[]): ControlValueAccessor {
  if (isBlank(valueAccessors)) return null;

  var defaultAccessor;
  var builtinAccessor;
  var customAccessor;

  valueAccessors.forEach(v => {
    if (v instanceof DefaultValueAccessor) {
      defaultAccessor = v;

    } else if (v instanceof CheckboxControlValueAccessor || v instanceof NumberValueAccessor ||
               v instanceof SelectControlValueAccessor) {
      if (isPresent(builtinAccessor))
        _throwError(dir, "More than one built-in value accessor matches");
      builtinAccessor = v;

    } else {
      if (isPresent(customAccessor))
        _throwError(dir, "More than one custom value accessor matches");
      customAccessor = v;
    }
  });

  if (isPresent(customAccessor)) return customAccessor;
  if (isPresent(builtinAccessor)) return builtinAccessor;
  if (isPresent(defaultAccessor)) return defaultAccessor;

  _throwError(dir, "No valid value accessor for");
  return null;
}

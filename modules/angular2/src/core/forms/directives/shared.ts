import {ListWrapper, StringMapWrapper} from 'angular2/src/core/facade/collection';
import {isBlank, isPresent, looseIdentical} from 'angular2/src/core/facade/lang';
import {BaseException, WrappedException} from 'angular2/src/core/facade/exceptions';

import {ControlContainer} from './control_container';
import {NgControl} from './ng_control';
import {Control} from '../model';
import {Validators} from '../validators';
import {ControlValueAccessor} from './control_value_accessor';
import {ElementRef, QueryList} from 'angular2/src/core/linker';
import {Renderer} from 'angular2/src/core/render';
import {DefaultValueAccessor} from './default_value_accessor';
import {NumberValueAccessor} from './number_value_accessor';
import {CheckboxControlValueAccessor} from './checkbox_value_accessor';
import {SelectControlValueAccessor} from './select_control_value_accessor';


export function controlPath(name: string, parent: ControlContainer): string[] {
  var p = ListWrapper.clone(parent.path);
  p.push(name);
  return p;
}

export function setUpControl(control: Control, dir: NgControl): void {
  if (isBlank(control)) _throwError(dir, "Cannot find control");
  if (isBlank(dir.valueAccessor)) _throwError(dir, "No value accessor for");

  control.validator = Validators.compose([control.validator, dir.validator]);
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

function _throwError(dir: NgControl, message: string): void {
  var path = dir.path.join(" -> ");
  throw new BaseException(`${message} '${path}'`);
}

export function setProperty(renderer: Renderer, elementRef: ElementRef, propName: string,
                            propValue: any) {
  renderer.setElementProperty(elementRef, propName, propValue);
}

export function isPropertyUpdated(changes: {[key: string]: any}, viewModel: any): boolean {
  if (!StringMapWrapper.contains(changes, "model")) return false;
  var change = changes["model"];

  if (change.isFirstChange()) return true;
  return !looseIdentical(viewModel, change.currentValue);
}

// TODO: vsavkin remove it once https://github.com/angular/angular/issues/3011 is implemented
export function selectValueAccessor(dir: NgControl, valueAccessors: ControlValueAccessor[]):
    ControlValueAccessor {
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

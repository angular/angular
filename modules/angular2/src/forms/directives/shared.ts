import {ListWrapper, iterableToList} from 'angular2/src/facade/collection';
import {isBlank, BaseException} from 'angular2/src/facade/lang';

import {ControlContainer} from './control_container';
import {NgControl} from './ng_control';
import {NgValidator} from './validators';
import {Control} from '../model';
import {Validators} from '../validators';
import {Renderer, ElementRef, QueryList} from 'angular2/angular2';


export function controlPath(name, parent: ControlContainer) {
  var p = ListWrapper.clone(parent.path);
  p.push(name);
  return p;
}

export function setUpControl(c: Control, dir: NgControl) {
  if (isBlank(c)) _throwError(dir, "Cannot find control");
  if (isBlank(dir.valueAccessor)) _throwError(dir, "No value accessor for");

  c.validator = Validators.compose([c.validator, dir.validator]);
  dir.valueAccessor.writeValue(c.value);

  // view -> model
  dir.valueAccessor.registerOnChange(newValue => {
    dir.viewToModelUpdate(newValue);
    c.updateValue(newValue);
    c.markAsDirty();
  });

  // model -> view
  c.registerOnChange(newValue => dir.valueAccessor.writeValue(newValue));

  // touched
  dir.valueAccessor.registerOnTouched(() => c.markAsTouched());
}

export function composeNgValidator(ngValidators: QueryList<NgValidator>): Function {
  if (isBlank(ngValidators)) return Validators.nullValidator;
  return Validators.compose(
      (<List<NgValidator>>iterableToList(ngValidators)).map(v => v.validator));
}

function _throwError(dir: NgControl, message: string): void {
  var path = ListWrapper.join(dir.path, " -> ");
  throw new BaseException(`${message} '${path}'`);
}

export function setProperty(renderer: Renderer, elementRef: ElementRef, propName: string,
                            propValue: any) {
  renderer.setElementProperty(elementRef.parentView.render, elementRef.boundElementIndex, propName,
                              propValue);
}
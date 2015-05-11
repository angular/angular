import {Directive} from 'angular2/src/core/annotations_impl/annotations';
import {Ancestor} from 'angular2/src/core/annotations_impl/visibility';
import {ElementRef} from 'angular2/src/core/compiler/element_ref';
import {Optional} from 'angular2/src/di/annotations_impl';
import {Renderer} from 'angular2/src/render/api';
import {isPresent, isString, CONST_EXPR, isBlank, BaseException} from 'angular2/src/facade/lang';
import {ListWrapper} from 'angular2/src/facade/collection';
import {ControlGroup, Control, isControl} from './model';
import {Validators} from './validators';

//export interface ControlValueAccessor {
//  writeValue(value):void{}
//  set onChange(fn){}
//}

function _lookupControl(groupDirective:ControlGroupDirective, controlOrName:any):any {
  if (isControl(controlOrName)) {
    return controlOrName;
  }

  if (isBlank(groupDirective)) {
    throw new BaseException(`No control group found for "${controlOrName}"`);
  }

  var control = groupDirective.findControl(controlOrName);

  if (isBlank(control)) {
    throw new BaseException(`Cannot find control "${controlOrName}"`);
  }

  return control;
}

/**
 * The default accessor for writing a value and listening to changes that is used by a {@link Control} directive.
 *
 * This is the default strategy that Angular uses when no other accessor is applied.
 *
 *  # Example
 *  ```
 *  <input type="text" [control]="loginControl">
 *  ```
 *
 * @exportedAs angular2/forms
 */
@Directive({
  selector: '[control]',
  hostListeners: {
    'change' : 'onChange($event.target.value)',
    'input' : 'onChange($event.target.value)'
  },
  hostProperties: {
    'value' : 'value'
  }
})
export class DefaultValueAccessor {
  value;
  onChange:Function;

  constructor() {
    this.onChange = (_) => {};
  }

  writeValue(value) {
    this.value = value
  }
}

/**
 * The accessor for writing a value and listening to changes on a checkbox input element.
 *
 *
 *  # Example
 *  ```
 *  <input type="checkbox" [control]="rememberLogin">
 *  ```
 *
 * @exportedAs angular2/forms
 */
@Directive({
  selector: 'input[type=checkbox][control]',
  hostListeners: {
    'change' : 'onChange($event.target.checked)'
  },
  hostProperties: {
    'checked' : 'checked'
  }
})
export class CheckboxControlValueAccessor {
  _elementRef:ElementRef;
  _renderer:Renderer;

  checked:boolean;
  onChange:Function;

  constructor(cd:ControlDirective, elementRef:ElementRef, renderer:Renderer) {
    this.onChange = (_) => {};
    this._elementRef = elementRef;
    this._renderer = renderer;
    cd.valueAccessor = this; //ControlDirective should inject CheckboxControlDirective
  }

  writeValue(value) {
    this._renderer.setElementProperty(this._elementRef.parentView.render, this._elementRef.boundElementIndex,
      'checked', value)
  }
}

/**
 * Binds a control to a DOM element.
 *
 * # Example
 *
 * In this example, we bind the control to an input element. When the value of the input element changes, the value of
 * the control will reflect that change. Likewise, if the value of the control changes, the input element reflects that
 * change.
 *
 * Here we use {@link formDirectives}, rather than importing each form directive individually, e.g.
 * `ControlDirective`, `ControlGroupDirective`. This is just a shorthand for the same end result.
 *
 *  ```
 * @Component({selector: "login-comp"})
 * @View({
 *      directives: [formDirectives],
 *      inline: "<input type='text' [control]='loginControl'>"
 *      })
 * class LoginComp {
 *  loginControl:Control;
 *
 *  constructor() {
 *    this.loginControl = new Control('');
 *  }
 * }
 *
 *  ```
 *
 * @exportedAs angular2/forms
 */
@Directive({
  selector: '[control]',
  properties: {
    'controlOrName' : 'control'
  }
})
export class ControlDirective {
  _groupDirective:ControlGroupDirective;

  _controlOrName:any;
  valueAccessor:any; //ControlValueAccessor

  validator:Function;

  constructor(@Optional() @Ancestor() groupDirective:ControlGroupDirective, valueAccessor:DefaultValueAccessor)  {
    this._groupDirective = groupDirective;
    this._controlOrName = null;
    this.valueAccessor = valueAccessor;
    this.validator = Validators.nullValidator;
  }

  set controlOrName(controlOrName) {
    this._controlOrName = controlOrName;

    if(isPresent(this._groupDirective)) {
      this._groupDirective.addDirective(this);
    }

    var c = this._control();
    c.validator = Validators.compose([c.validator, this.validator]);

    this._updateDomValue();
    this._setUpUpdateControlValue();
  }

  _updateDomValue() {
    this.valueAccessor.writeValue(this._control().value);
  }

  _setUpUpdateControlValue() {
    this.valueAccessor.onChange = (newValue) => this._control().updateValue(newValue);
  }

  _control() {
    return _lookupControl(this._groupDirective, this._controlOrName);
  }
}

/**
 * Binds a control group to a DOM element.
 *
 * # Example
 *
 * In this example, we bind the control group to the form element, and we bind the login and password controls to the
 * login and password elements.
 *
 * Here we use {@link formDirectives}, rather than importing each form directive individually, e.g.
 * `ControlDirective`, `ControlGroupDirective`. This is just a shorthand for the same end result.
 *
 *  ```
 * @Component({selector: "login-comp"})
 * @View({
 *      directives: [formDirectives],
 *      inline: "<form [control-group]='loginForm'>" +
 *              "Login <input type='text' control='login'>" +
 *              "Password <input type='password' control='password'>" +
 *              "<button (click)="onLogin()">Login</button>" +
 *              "</form>"
 *      })
 * class LoginComp {
 *  loginForm:ControlGroup;
 *
 *  constructor() {
 *    this.loginForm = new ControlGroup({
 *      login: new Control(""),
 *      password: new Control("")
 *    });
 *  }
 *
 *  onLogin() {
 *    // this.loginForm.value
 *  }
 * }
 *
 *  ```
 *
 * @exportedAs angular2/forms
 */
@Directive({
  selector: '[control-group]',
  properties: {
    'controlOrName' : 'control-group'
  }
})
export class ControlGroupDirective {
  _groupDirective:ControlGroupDirective;
  _directives:List<ControlDirective>;
  _controlOrName:any;

  constructor(@Optional() @Ancestor() groupDirective:ControlGroupDirective) {
    this._groupDirective = groupDirective;
    this._directives = ListWrapper.create();
  }

  set controlOrName(controlOrName) {
    this._controlOrName = controlOrName;
    this._updateDomValue();
  }

  _updateDomValue() {
    ListWrapper.forEach(this._directives, (cd) => cd._updateDomValue());
  }

  addDirective(c:ControlDirective) {
    ListWrapper.push(this._directives, c);
  }

  findControl(name:string):any {
    return this._getControlGroup().controls[name];
  }

  _getControlGroup():ControlGroup {
    return _lookupControl(this._groupDirective, this._controlOrName);
  }
}

/**
 *
 * A list of all the form directives used as part of a `@View` annotation.
 *
 *  This is a shorthand for importing them each individually.
 *
 * @exportedAs angular2/forms
 */
export const formDirectives:List = CONST_EXPR([
  ControlGroupDirective, ControlDirective, CheckboxControlValueAccessor, DefaultValueAccessor
]);

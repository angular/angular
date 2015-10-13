import {forwardRef, Provider, OpaqueToken} from 'angular2/src/core/di';
import {CONST_EXPR} from 'angular2/src/core/facade/lang';
import {Attribute, Directive} from 'angular2/src/core/metadata';
import {Validators, NG_VALIDATORS} from '../validators';
import {NumberWrapper} from "angular2/src/core/facade/lang";

const REQUIRED_VALIDATOR =
    CONST_EXPR(new Provider(NG_VALIDATORS, {useValue: Validators.required, multi: true}));

@Directive({
  selector: '[required][ng-control],[required][ng-form-control],[required][ng-model]',
  providers: [REQUIRED_VALIDATOR]
})
export class RequiredValidator {
}

function createMinLengthValidator(dir): any {
  return Validators.minLength(dir.minLength);
}
const MIN_LENGTH_VALIDATOR = CONST_EXPR(new Provider(NG_VALIDATORS, {
  useFactory: createMinLengthValidator,
  deps: [forwardRef(() => MinLengthValidator)],
  multi: true
}));
@Directive({
  selector: '[minlength][ng-control],[minlength][ng-form-control],[minlength][ng-model]',
  providers: [MIN_LENGTH_VALIDATOR]
})
export class MinLengthValidator {
  minLength: number;
  constructor(@Attribute("minlength") minLength: string) {
    this.minLength = NumberWrapper.parseInt(minLength, 10);
  }
}

function createMaxLengthValidator(dir): any {
  return Validators.maxLength(dir.maxLength);
}
const MAX_LENGTH_VALIDATOR = CONST_EXPR(new Provider(NG_VALIDATORS, {
  useFactory: createMaxLengthValidator,
  deps: [forwardRef(() => MaxLengthValidator)],
  multi: true
}));
@Directive({
  selector: '[maxlength][ng-control],[maxlength][ng-form-control],[maxlength][ng-model]',
  providers: [MAX_LENGTH_VALIDATOR]
})
export class MaxLengthValidator {
  maxLength: number;
  constructor(@Attribute("maxlength") maxLength: string) {
    this.maxLength = NumberWrapper.parseInt(maxLength, 10);
  }
}
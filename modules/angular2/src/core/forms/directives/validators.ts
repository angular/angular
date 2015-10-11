import {forwardRef, Provider, OpaqueToken} from 'angular2/src/core/di';
import {CONST_EXPR} from 'angular2/src/core/facade/lang';
import {Directive} from 'angular2/src/core/metadata';
import {Validators, NG_VALIDATORS} from '../validators';

const DEFAULT_VALIDATORS =
    CONST_EXPR(new Provider(NG_VALIDATORS, {toValue: Validators.required, multi: true}));

@Directive({
  selector: '[required][ng-control],[required][ng-form-control],[required][ng-model]',
  bindings: [DEFAULT_VALIDATORS]
})
export class DefaultValidators {
}

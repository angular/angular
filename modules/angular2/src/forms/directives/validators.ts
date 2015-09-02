import {forwardRef, OpaqueToken, Binding} from 'angular2/di';
import {CONST_EXPR} from 'angular2/src/core/facade/lang';
import {Directive} from 'angular2/metadata';
import {Validators, NG_VALIDATORS} from '../validators';

const DEFAULT_VALIDATORS =
    CONST_EXPR(new Binding(NG_VALIDATORS, {toValue: Validators.required, multi: true}));

@Directive({
  selector: '[required][ng-control],[required][ng-form-control],[required][ng-model]',
  bindings: [DEFAULT_VALIDATORS]
})
export class DefaultValidators {
}

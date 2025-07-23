import {
  ControlValueAccessor,
  Validators,
  type AbstractControl,
  type NgControl,
  type ValidationErrors,
  type ValidatorFn,
} from '@angular/forms';
import type {FormField} from '../api/types';
import {REQUIRED} from '../logic_node';

export type InteropSharedKeys =
  | 'value'
  | 'valid'
  | 'invalid'
  | 'touched'
  | 'untouched'
  | 'disabled'
  | 'enabled'
  | 'errors'
  | 'pristine'
  | 'dirty';

export class InteropNgControl
  implements
    Pick<NgControl, InteropSharedKeys | 'control' | 'valueAccessor'>,
    Pick<AbstractControl<unknown>, InteropSharedKeys | 'hasValidator'>
{
  constructor(protected field: () => FormField<unknown>) {}

  readonly control: AbstractControl<any, any> = this as unknown as AbstractControl<any, any>;

  get value(): any {
    return this.field().value();
  }
  get valid(): boolean {
    return this.field().valid();
  }
  get invalid(): boolean {
    return !this.field().valid();
  }

  get pending(): boolean | null {
    return false;
  }
  get disabled(): boolean {
    return this.field().disabled();
  }
  get enabled(): boolean {
    return !this.field().disabled();
  }
  get errors(): ValidationErrors | null {
    const errors = this.field().errors();
    if (errors.length === 0) {
      return null;
    }
    const errObj: ValidationErrors = {};
    for (const error of errors) {
      errObj[error.kind] = error;
    }
    return errObj;
  }
  get pristine(): boolean {
    return true;
  }
  get dirty(): boolean {
    return false;
  }
  get touched(): boolean {
    return this.field().touched();
  }
  get untouched(): boolean {
    return !this.field().touched();
  }
  get submitted(): boolean {
    return this.field().submittedStatus() === 'submitted';
  }

  valueAccessor: ControlValueAccessor | null = null;

  hasValidator(validator: ValidatorFn): boolean {
    if (validator === Validators.required) {
      return this.field().metadata(REQUIRED);
    }
    return false;
  }
}

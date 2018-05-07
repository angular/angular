// #docregion
import { Directive } from '@angular/core';
import { AbstractControl, FormGroup, NG_VALIDATORS, ValidationErrors, Validator, ValidatorFn } from '@angular/forms';

// #docregion cross-validation-directive-with-validator
// #docregion cross-validation-validator
/** A hero's name can't match the hero's alter ego */
export const identityRevealedValidator: ValidatorFn = (control: FormGroup): ValidationErrors | null => {
  const name = control.get('name');
  const alterEgo = control.get('alterEgo');

  return name && alterEgo && name.value !== alterEgo.value ? null : { 'identityRevealed': { value: true } };
};
// #enddocregion cross-validation-validator

// #docregion cross-validation-directive
@Directive({
  selector: '[appIdentityRevealed]',
  providers: [{ provide: NG_VALIDATORS, useExisting: IdentityRevealedValidatorDirective, multi: true }]
})
export class IdentityRevealedValidatorDirective implements Validator {
  validate(control: AbstractControl): ValidationErrors {
    return identityRevealedValidator(control)
  }
}
// #enddocregion cross-validation-directive
// #enddocregion cross-validation-directive-with-validator


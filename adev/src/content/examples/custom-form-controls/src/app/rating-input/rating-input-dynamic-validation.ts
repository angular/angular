// #docregion
import {
  FormsModule,
  NG_VALUE_ACCESSOR,
  NG_VALIDATORS,
  ControlValueAccessor,
  Validator,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import {Component, forwardRef, signal, input, effect} from '@angular/core';

@Component({
  selector: 'app-rating-input',
  imports: [FormsModule],
  templateUrl: './rating-input.html',
  styleUrls: ['./rating-input.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RatingInput),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => RatingInput),
      multi: true,
    },
  ],
})
export class RatingInput implements ControlValueAccessor, Validator {
  // #docregion dynamic-validation
  // Input that affects validation
  required = input<boolean>(false);

  constructor() {
    // Trigger validation when input changes
    effect(() => {
      this.required();
      this.onValidatorChange();
    });
  }

  private onValidatorChange = () => {};

  registerOnValidatorChange(fn: () => void): void {
    this.onValidatorChange = fn;
  }

  validate(control: AbstractControl): ValidationErrors | null {
    if (this.required() && !control.value) {
      return {required: true};
    }
    return null;
  }

  // #enddocregion dynamic-validation
  rating = signal(0);
  stars = [1, 2, 3, 4, 5];
  disabled = signal(false);

  private onChange: (value: number) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: number): void {
    this.rating.set(value || 0);
  }

  registerOnChange(fn: (value: number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  setRating(star: number): void {
    if (!this.disabled()) {
      this.rating.set(star);
      this.onChange(this.rating());
    }
  }

  markAsTouched(): void {
    this.onTouched();
  }
}
// #enddocregion

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
import {Component, forwardRef, signal} from '@angular/core';

// #docregion validation
@Component({
  selector: 'app-rating-input',
  imports: [FormsModule],
  templateUrl: './rating-input.html',
  styleUrls: ['./rating-input.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RatingInputWithValidation),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => RatingInputWithValidation),
      multi: true,
    },
  ],
})
export class RatingInputWithValidation implements ControlValueAccessor, Validator {
  // Implement the Validator interface
  validate(control: AbstractControl): ValidationErrors | null {
    const value = control.value;

    if (value === null || value === undefined || value === 0) {
      return {required: true};
    }

    return null;
  }

  // #enddocregion validation

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

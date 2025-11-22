import {Component, forwardRef, signal} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule} from '@angular/forms';

// #docregion
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
  ],
  host: {
    '(blur)': 'markAsTouched()',
  },
})
export class RatingInput implements ControlValueAccessor {
  rating = signal(0);
  stars = [1, 2, 3, 4, 5];
  disabled = signal(false);

  // Callback functions registered by Angular forms
  private onChange: (value: number) => void = () => {};
  private onTouched: () => void = () => {};

  // Called when the form control value is set programmatically
  writeValue(value: number): void {
    this.rating.set(value || 0);
  }

  // Register callback for value changes
  registerOnChange(fn: (value: number) => void): void {
    this.onChange = fn;
  }

  // Register callback for touched state
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  // Called when disabled state changes
  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  // Update the rating and notify Angular
  setRating(star: number): void {
    if (!this.disabled()) {
      this.rating.set(star);
      this.onChange(this.rating());
    }
  }

  // Mark as touched when user interacts and leaves
  markAsTouched(): void {
    this.onTouched();
  }
}
// #enddocregion

# Angular Signal Forms - ( FormValueControl )

## Table of Contents

- [Signal Form FormValueControl](#formValueControl)

## Signal Forms FormValueControl

```typescript
interface Rating {
  rating: number;
}

import {
  form,
  FormField,
  FormValueControl,
  ValidationError,
  WithOptionalField,
} from '@angular/forms/signals';
import {MatIconModule} from '@angular/material/icon';
import {MatError} from '@angular/material/form-field';

@Component({
  selector: 'app-rating',
  imports: [MatIconModule, MatError],
  template: `
    <div class="star-rating-container">
      @for (star of starArray(); track $index) {
        <mat-icon
          (click)="rate(star)"
          class="star-icon"
          [class.readonly]="readonly()"
          [class.error]="invalid()"
          [class]="{filled: star <= value()}"
        >
          {{ getStarIcon(star) }}
        </mat-icon>
      }
      @if (errors().at(0)?.message) {
        <mat-error>
          {{ errors().at(0)?.message }}
        </mat-error>
      }
    </div>
  `,
  styles: ``,
})
export class Rating implements FormValueControl<number> {
  // Required: The value of the control, exposed as a two-way binding.
  readonly value = model<number>(0);
  // Optional: Bindings for other form control states.
  readonly readonly = input<boolean>(false);
  readonly invalid = input<boolean>(false);
  readonly errors: InputSignal<readonly WithOptionalField<ValidationError>[]> = input<
    readonly WithOptionalField<ValidationError>[]
  >([]);

  starArray: Signal<number[]> = signal(
    Array(5)
      .fill(0)
      .map((_, i) => i + 1),
  );

  getStarIcon(index: number): string {
    const floorRating = Math.floor(this.value());
    if (index <= floorRating) {
      return 'star'; // Full star
    } else {
      return 'star_border'; // Empty star
    }
  }
  rate(index: number): void {
    if (!this.readonly()) {
      this.value.set(index);
    }
  }
}

import {FormField} from '@angular/forms/signals';

@Component({
  selector: 'app-signal-forms',
  imports: [FormField, Rating],
  template: `
    <form autocomplete="off" (submit)="submit($event)">
      <div class="form-field">
        <app-rating [formField]="ratingForm.rating"> </app-rating>
        <!-- print to show the value updation -->
        {{ ratingForm.rating().value() }}
      </div>
    </form>
  `,
  styles: ``,
})
export class SignalForms {
  readonly ratingModel = signal<Rating>({
    rating: 0,
  });

  readonly ratingForm = form(this.ratingModel);

  submit(event: Event): void {
    event.preventDefault();
    console.log(this.ratingForm.rating().value());
  }
}
```

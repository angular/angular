import {Component} from '@angular/core';
import {ReactiveFormsModule, FormControl, FormGroup, Validators} from '@angular/forms';
import {JsonPipe} from '@angular/common';
import {RatingInput} from './rating-input/rating-input';

@Component({
  selector: 'app-root',
  imports: [ReactiveFormsModule, JsonPipe, RatingInput],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class App {
  // Reactive form example
  reviewForm = new FormGroup({
    rating: new FormControl(0, [Validators.required, Validators.min(1)]),
  });

  get ratingControl() {
    return this.reviewForm.get('rating') as FormControl;
  }

  submitReview(): void {
    if (this.reviewForm.valid) {
      console.log('Rating submitted:', this.reviewForm.value);
    }
  }

  // Example of programmatic control
  setRatingTo5(): void {
    this.reviewForm.patchValue({rating: 5});
  }

  disableRating(): void {
    this.ratingControl.disable();
  }

  enableRating(): void {
    this.ratingControl.enable();
  }
}

// #docregion
import {Component, model} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {RatingInput} from './rating-input/rating-input';

@Component({
  selector: 'app-root',
  imports: [FormsModule, RatingInput],
  templateUrl: './app-form-template.html',
  styleUrls: ['./app.css'],
})
export class App {
  // Template-driven form example
  templateRating = model(0);

  submitTemplateReview(): void {
    console.log('Template rating submitted:', this.templateRating());
  }
}
// #enddocregion

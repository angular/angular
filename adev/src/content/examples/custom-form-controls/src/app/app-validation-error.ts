import {Component} from '@angular/core';
import {ReactiveFormsModule, FormControl, FormGroup, Validators} from '@angular/forms';
import {ControlErrorsDirective} from './validation-error/directive/control-errors.directive';

@Component({
  selector: 'app-root',
  imports: [ReactiveFormsModule, ControlErrorsDirective],
  templateUrl: './app-validation-error.html',
  styleUrls: ['./app-validation-error.css'],
})
export class AppValidationError {
  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    username: new FormControl('', [Validators.required, Validators.minLength(3)]),
  });

  onSubmit(): void {
    if (this.form.valid) {
      console.log('Form submitted:', this.form.value);
    }
  }
}

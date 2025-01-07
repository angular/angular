import {Component, Input} from '@angular/core';
import {AbstractControl} from '@angular/forms';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-error',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (control && control.errors) {
      <div class="error-message">
        {{ getFirstError() }}
      </div>
    }
  `,
  styles: [
    `
    .error-message {
      color: red;
      font-size: 0.8em;
      margin-top: 4px;
    }
  `,
  ],
})
export class ErrorComponent {
  @Input() control!: AbstractControl;

  getFirstError(): string {
    if (!this.control?.errors) {
      return '';
    }

    const firstErrorKey = Object.keys(this.control.errors)[0];
    const error = this.control.errors[firstErrorKey];

    return typeof error === 'string' ? error : firstErrorKey;
  }
}

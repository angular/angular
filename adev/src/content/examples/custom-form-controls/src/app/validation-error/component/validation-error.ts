import {Component, input} from '@angular/core';

@Component({
  selector: 'app-validation-error',
  template: `
    @if (text()) {
     <p class="error-message">{{ text() }}</p>
    }
  `,
  styles: [
    `.error-message {
        color: #dc3545;
        font-size: 0.875rem;
        margin-top: 0.25rem;
      }
    `,
  ],
})
export class ValidationError {
  text = input<string | null>(null);
}

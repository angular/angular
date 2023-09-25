// #docplaster
import { Component, Input } from '@angular/core';
// #docregion submitButton, submitButtonNarrow
@Component({
// #enddocregion submitButton, submitButtonNarrow
  standalone: true,
  selector: 'app-submit-button',
  template: `<p>submit-button works!</p> `
  // #docregion submitButton, submitButtonNarrow
})
export class SubmitButtonComponent {
// #enddocregion submitButtonNarrow
  private disabledValue = false;

  @Input()
  get disabled(): boolean {
    return this.disabledValue;
  }

  set disabled(value: boolean|'') {
    this.disabledValue = (value === '') || value;
  }
}
// #enddocregion submitButton
@Component({
  standalone: true,
  selector: 'app-submit-button-valid',
  template: `<p>submit-button works!</p>`
})
export class SubmitButtonValidComponent {

  // #docregion submitButtonNarrow
  static ngAcceptInputType_disabled: boolean|'';

  private disabledValue = false;

  @Input()
  get disabled(): boolean {
    return this.disabledValue;
  }
  // #enddocregion submitButtonNarrow
  /*
  // #docregion submitButtonNarrow
  set disabled(value: boolean) {
    this.disabledValue = (value === '') || value;
  }
  // #enddocregion submitButtonNarrow
  */
  // #docregion submitButtonNarrow
}
// #enddocregion submitButtonNarrow

// #docplaster ...
import { Component, Input } from '@angular/core';
// #docregion submitButton, submitButtonNarrow
@Component({
  // #enddocregion submitButton, submitButtonNarrow
// #docplaster
  selector: 'app-submit-button',
  templateUrl: './submit-button.component.html',
  styleUrls: ['./submit-button.component.css']
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
  selector: 'app-submit-button-valid',
  templateUrl: './submit-button.component.html',
  styleUrls: ['./submit-button.component.css']
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

import { Component, Input } from '@angular/core';
@Component({
  selector: 'app-submit-button',
  templateUrl: './submit-button.component.html',
  styleUrls: ['./submit-button.component.css']
})
export class SubmitButtonComponent {
  private disabledValue = false;

  @Input()
  get disabled(): boolean {
    return this.disabledValue;
  }

  set disabled(value: boolean|'') {
    this.disabledValue = (value === '') || value;
  }
}
@Component({
  selector: 'app-submit-button-valid',
  templateUrl: './submit-button.component.html',
  styleUrls: ['./submit-button.component.css']
})
export class SubmitButtonValidComponent {

  // tslint:disable: variable-name
  static ngAcceptInputType_disabled: boolean|'';

  private disabledValue = false;

  @Input()
  get disabled(): boolean {
    return this.disabledValue;
  }
  /*
  set disabled(value: boolean) {
    this.disabledValue = (value === '') || value;
  }
  */
}

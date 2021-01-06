import {Component} from '@angular/core';

/**
 * @title Testing with MatDatepickerInputHarness
 */
@Component({
  selector: 'datepicker-harness-example',
  templateUrl: 'datepicker-harness-example.html',
})
export class DatepickerHarnessExample {
  date: Date|null = null;
  minDate: Date|null = null;
}

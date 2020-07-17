import {Component} from '@angular/core';

/** @title Datepicker start date */
@Component({
  selector: 'datepicker-start-view-example',
  templateUrl: 'datepicker-start-view-example.html',
})
export class DatepickerStartViewExample {
  startDate = new Date(1990, 0, 1);
}

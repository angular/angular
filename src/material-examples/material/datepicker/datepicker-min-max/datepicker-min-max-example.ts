import {Component} from '@angular/core';

/** @title Datepicker with min & max validation */
@Component({
  selector: 'datepicker-min-max-example',
  templateUrl: 'datepicker-min-max-example.html',
  styleUrls: ['datepicker-min-max-example.css'],
})
export class DatepickerMinMaxExample {
  minDate = new Date(2000, 0, 1);
  maxDate = new Date(2020, 0, 1);
}

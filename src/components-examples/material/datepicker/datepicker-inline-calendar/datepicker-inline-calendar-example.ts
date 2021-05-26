import {Component} from '@angular/core';

/** @title Datepicker inline calendar example */
@Component({
  selector: 'datepicker-inline-calendar-example',
  templateUrl: 'datepicker-inline-calendar-example.html',
  styleUrls: ['datepicker-inline-calendar-example.css'],
})
export class DatepickerInlineCalendarExample {
  selected: Date | null;
}

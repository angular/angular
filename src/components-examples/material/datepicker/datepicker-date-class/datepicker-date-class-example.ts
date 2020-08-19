import {Component, ViewEncapsulation} from '@angular/core';
import {MatCalendarCellClassFunction} from '@angular/material/datepicker';

/** @title Datepicker with custom date classes */
@Component({
  selector: 'datepicker-date-class-example',
  templateUrl: 'datepicker-date-class-example.html',
  styleUrls: ['datepicker-date-class-example.css'],
  encapsulation: ViewEncapsulation.None,
})
export class DatepickerDateClassExample {
  dateClass: MatCalendarCellClassFunction<Date> = (cellDate, view) => {
    // Only highligh dates inside the month view.
    if (view === 'month') {
      const date = cellDate.getDate();

      // Highlight the 1st and 20th day of each month.
      return (date === 1 || date === 20) ? 'example-custom-date-class' : '';
    }

    return '';
  }
}

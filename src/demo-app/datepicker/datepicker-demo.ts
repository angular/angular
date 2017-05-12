import {Component} from '@angular/core';


@Component({
  moduleId: module.id,
  selector: 'datepicker-demo',
  templateUrl: 'datepicker-demo.html',
  styleUrls: ['datepicker-demo.css'],
})
export class DatepickerDemo {
  touch: boolean;
  filterOdd: boolean;
  yearView: boolean;
  minDate: Date;
  maxDate: Date;
  startAt: Date;
  date: Date;
  dateFilter = (date: Date) => date.getMonth() % 2 == 1 && date.getDate() % 2 == 0;
}

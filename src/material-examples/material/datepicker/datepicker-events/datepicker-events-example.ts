import {Component} from '@angular/core';
import {MatDatepickerInputEvent} from '@angular/material/datepicker';

/** @title Datepicker input and change events */
@Component({
  selector: 'datepicker-events-example',
  templateUrl: 'datepicker-events-example.html',
  styleUrls: ['datepicker-events-example.css'],
})
export class DatepickerEventsExample {
  events: string[] = [];

  addEvent(type: string, event: MatDatepickerInputEvent<Date>) {
    this.events.push(`${type}: ${event.value}`);
  }
}

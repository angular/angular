import {Component} from '@angular/core';

const today = new Date();

const formatter = new Intl.DateTimeFormat(undefined, {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
});

/** @title Listbox with complex object as values. */
@Component({
  selector: 'cdk-listbox-compare-with-example',
  exportAs: 'cdkListboxCompareWithExample',
  templateUrl: 'cdk-listbox-compare-with-example.html',
  styleUrls: ['cdk-listbox-compare-with-example.css'],
})
export class CdkListboxCompareWithExample {
  slots = [12, 13, 14, 15].map(
    hour => new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, hour),
  );

  appointment: readonly Date[] = [
    new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 14),
  ];

  compareDate(date1: Date, date2: Date) {
    return date1.getTime() === date2.getTime();
  }

  formatTime(date: Date) {
    return formatter.format(date);
  }

  formatAppointment() {
    return this.appointment.map(a => this.formatTime(a));
  }
}

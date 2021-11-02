import { Component, OnInit } from '@angular/core';

import { EventsService } from './events.service';

const DAY = 24 * 60 * 60 * 1000;
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export type date = string; // of the format `YYYY-MM-DD`.
export interface Duration {
  start: date;
  end: date;
}

export interface Event {
  name: string;
  location: string;
  linkUrl: string;
  tooltip?: string;
  date: Duration;
  workshopsDate?: Duration;
}

@Component({
  selector: 'aio-events',
  templateUrl: 'events.component.html'
})
export class EventsComponent implements OnInit {

  pastEvents: Event[];
  upcomingEvents: Event[];

  constructor(private eventsService: EventsService) { }

  ngOnInit() {
    this.eventsService.events.subscribe(events => {
      this.pastEvents = events
          .filter(event => new Date(event.date.end).getTime() < Date.now() - DAY)
          .sort((l: Event, r: Event) => isBefore(l.date, r.date) ? 1 : -1);

      this.upcomingEvents = events
          .filter(event => new Date(event.date.end).getTime() >= Date.now() - DAY)
          .sort((l: Event, r: Event) => isBefore(l.date, r.date) ? -1 : 1);
    });
  }

  getEventDates(event: Event) {
    let dateString;

    // Check if there is a workshop
    if (event.workshopsDate) {
      const mainEventDateString = `${processDate(event.date)} (conference)`;
      const workshopsDateString = `${processDate(event.workshopsDate)} (workshops)`;
      const areWorkshopsBeforeEvent = isBefore(event.workshopsDate, event.date);

      dateString = areWorkshopsBeforeEvent ?
          `${workshopsDateString}, ${mainEventDateString}` :
          `${mainEventDateString}, ${workshopsDateString}`;
    } else {
      // If no work shop date create conference date string
      dateString = processDate(event.date);
    }
    dateString = `${dateString}, ${new Date(event.date.end).getUTCFullYear()}`;
    return dateString;
  }
}

function processDate(dates: Duration) {
  // Covert Date sting to date object for comparisons
  const startDate = new Date(dates.start);
  const endDate = new Date(dates.end);

  // Create a date string in the start like January 31
  let processedDate = `${MONTHS[startDate.getUTCMonth()]} ${startDate.getUTCDate()}`;

  // If they are in different months add the string '- February 2' Making the final string January 31 - February 2
  if (startDate.getUTCMonth() !== endDate.getUTCMonth()) {
    processedDate = `${processedDate} - ${MONTHS[endDate.getUTCMonth()]} ${endDate.getUTCDate()}`;
  } else if (startDate.getUTCDate() !== endDate.getUTCDate()) {
    // If not add - date eg it will make // January 30-31
    processedDate = `${processedDate}-${endDate.getUTCDate()}`;
  }

  return processedDate;
}

function isBefore(duration1: Duration, duration2: Duration): boolean {
  return (duration1.start < duration2.start) ||
      (duration1.start === duration2.start && duration1.end < duration2.end);
}

import { Component, OnInit } from '@angular/core';

import { EventsService } from './events.service';

const DAY = 24 * 60 * 60 * 1000;

export interface AngularEvent {
  name: string;
  linkUrl?: string;
  date: {
    start: `${number}-${number}-${number}`; // Date string in the format: `YYYY-MM-DD`
  };
}

@Component({
  selector: 'aio-events',
  templateUrl: 'events.component.html'
})
export class EventsComponent implements OnInit {

  pastEvents: AngularEvent[] = [];
  upcomingEvents: AngularEvent[] = [];

  constructor(private eventsService: EventsService) { }

  ngOnInit() {
    this.eventsService.events.subscribe(events => {
      this.pastEvents = events
          .filter(event => isInThePast(event))
          .sort((l: AngularEvent, r: AngularEvent) => (l.date.start < r.date.start) ? 1 : -1);

      this.upcomingEvents = events
          .filter(event => !isInThePast(event))
          .sort((l: AngularEvent, r: AngularEvent) => (l.date.start < r.date.start) ? -1 : 1);
    });
  }
}

function isInThePast(event: AngularEvent): boolean {
  return new Date(event.date.start).getTime() < Date.now() - DAY;
}

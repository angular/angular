// #docplaster
// #docregion
import { Component, OnInit } from '@angular/core';
import { EventAggregatorService, AppEvent } from './event-aggregator.service';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'message-log',
  template: `
    <h3>Event Log</h3>

    <ul>
      <li *ngFor="let event of events$ | async">{{ event.message }}</li>
    </ul>
  `
})
export class MessageLogComponent implements OnInit {
  events$: Observable<AppEvent[]>;

  constructor(private eventService: EventAggregatorService) {}

  ngOnInit() {
    this.events$ = this.eventService.events$;
  }
}

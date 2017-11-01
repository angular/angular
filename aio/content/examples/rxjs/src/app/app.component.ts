// #docplaster
// #docregion
import { Component, OnInit } from '@angular/core';
import { EventAggregatorService } from './event-aggregator.service';

@Component({
  selector: 'my-app',
  template: `
    <h1 class="title">RxJS in Angular</h1>

    <a routerLink="/heroes">Heroes</a><br>
    <a routerLink="/hero/counter">Hero Counter</a><br>

    <router-outlet></router-outlet>

    <message-log></message-log>
  `
})
export class AppComponent implements OnInit {
  constructor(
    private eventService: EventAggregatorService) {}

  ngOnInit() {
    this.eventService.add({
      type: 'init',
      message: 'Application Initialized'
    });
  }
}

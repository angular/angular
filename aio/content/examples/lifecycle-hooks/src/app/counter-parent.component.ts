import { Component } from '@angular/core';

import { LoggerService } from './logger.service';

@Component({
  selector: 'counter-parent',
  template: `
  <div class="parent">
    <h2>Counter Spy</h2>

    <button (click)="updateCounter()">Update counter</button>
    <button (click)="reset()">Reset Counter</button>

    <app-counter [counter]="value"></app-counter>

    <h4>-- Spy Lifecycle Hook Log --</h4>
    <div *ngFor="let msg of spyLog">{{msg}}</div>
  </div>
  `,
  styles: ['.parent {background: gold;}'],
  providers: [LoggerService]
})
export class CounterParentComponent {
  value: number;
  spyLog: string[] = [];

  private logger: LoggerService;

  constructor(logger: LoggerService) {
    this.logger = logger;
    this.spyLog = logger.logs;
    this.reset();
  }

  updateCounter() {
    this.value += 1;
    this.logger.tick();
  }

  reset() {
    this.logger.log('-- reset --');
    this.value = 0;
    this.logger.tick();
  }
}

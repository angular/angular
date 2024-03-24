import {Component} from '@angular/core';

import {LoggerService} from './logger.service';

@Component({
  selector: 'after-view-parent',
  template: `
  <h2>AfterView</h2>
  
  @if (show) {
    <after-view ></after-view>
  }
  
  <div class="info">
    <h3>AfterView Logs</h3>
    <button type="button" (click)="reset()">Reset</button>
    @for (msg of logger.logs; track msg) {
      <div class="log">{{msg}}</div>
    }
  </div>
  `,
  providers: [LoggerService],
})
export class AfterViewParentComponent {
  show = true;

  constructor(public logger: LoggerService) {}

  reset() {
    this.logger.clear();
    // quickly remove and reload AfterViewComponent which recreates it
    this.show = false;
    this.logger.tick_then(() => (this.show = true));
  }
}

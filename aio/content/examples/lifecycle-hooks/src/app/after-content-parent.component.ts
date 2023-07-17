import { Component } from '@angular/core';

import { LoggerService } from './logger.service';

@Component({
  selector: 'after-content-parent',
  template: `
  <div class="parent">
    <h2>AfterContent</h2>

    <div *ngIf="show">` +
      // #docregion parent-template
      `<after-content>
        <app-child></app-child>
      </after-content>`
      // #enddocregion parent-template
    + `</div>

    <div class="info">
      <h3>AfterContent Logs</h3>
      <button type="button" (click)="reset()">Reset</button>
      <div *ngFor="let msg of logger.logs" class="log">{{msg}}</div>
    </div>
  </div>
  `,
  providers: [LoggerService]
})
export class AfterContentParentComponent {
  show = true;

  constructor(public logger: LoggerService) { }

  reset() {
    this.logger.clear();
    // quickly remove and reload AfterContentComponent which recreates it
    this.show = false;
    this.logger.tick_then(() => this.show = true);
  }
}

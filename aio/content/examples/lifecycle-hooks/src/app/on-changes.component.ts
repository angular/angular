/* tslint:disable:forin */
// #docregion
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

import { Hero } from './hero';

@Component({
  selector: 'on-changes',
  template: `
  <div class="info">
    <p>{{hero.name}} can {{power}}</p>

    <h3>Change Log</h3>
    <div *ngFor="let chg of changeLog" class="log">{{chg}}</div>
  </div>
  `
})
export class OnChangesComponent implements OnChanges {
// #docregion inputs
  @Input() hero!: Hero;
  @Input() power = '';
// #enddocregion inputs

  changeLog: string[] = [];

  // #docregion ng-on-changes
  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      const chng = changes[propName];
      const cur  = JSON.stringify(chng.currentValue);
      const prev = JSON.stringify(chng.previousValue);
      this.changeLog.push(`${propName}: currentValue = ${cur}, previousValue = ${prev}`);
    }
  }
  // #enddocregion ng-on-changes

  reset() { this.changeLog = []; }
}

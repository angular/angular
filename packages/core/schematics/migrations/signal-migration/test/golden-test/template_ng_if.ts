// tslint:disable

import {Component, Input} from '@angular/core';

@Component({
  template: `
    @if (first) {
      {{first}}
    }

    <ng-template [ngIf]="second">
      {{second}}
    </ng-template>

    <div *ngIf="third">
      {{third}}
    </div>

    <div *ngIf="fourth">
      {{notTheInput}}
    </div>

    @if (fifth) {
      {{notTheInput}}
    }
  `,
})
export class MyComp {
  @Input() first = true;
  @Input() second = false;
  @Input() third = true;
  @Input() fourth = true;
  @Input() fifth = true;
}

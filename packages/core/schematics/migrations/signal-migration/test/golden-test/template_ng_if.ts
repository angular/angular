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
  `,
})
export class MyComp {
  @Input() first = true;
  @Input() second = false;
  @Input() third = true;
}

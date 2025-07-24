import {Component} from '@angular/core';

@Component({
    selector: 'test-cmp',
    template: `
    <ng-template [ngIf]="showMessage()">
      <div>{{ name }}</div>
      <hr>
    </ng-template>`,
    standalone: false
})
export class TestCmp {
}

import {Component, NgModule, NO_ERRORS_SCHEMA} from '@angular/core';

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
  declare showMessage: () => boolean;
}

@NgModule({declarations: [TestCmp], schemas: [NO_ERRORS_SCHEMA]})
export class TestCmpModule {
}

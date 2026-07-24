import {Component, NgModule, NO_ERRORS_SCHEMA} from '@angular/core';

@Component({
    selector: 'test-cmp',
    template: `<ng-template ngFor [ngForOf]="items" let-item>{{ item }}</ng-template>`,
    standalone: false
})
export class TestCmp {
  declare items: any[];
}

@NgModule({declarations: [TestCmp], schemas: [NO_ERRORS_SCHEMA]})
export class TestCmpModule {
}

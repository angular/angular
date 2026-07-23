import {Component} from '@angular/core';

@Component({
    selector: 'test-cmp',
    template: `<ng-template ngFor [ngForOf]="items" let-item>{{ item }}</ng-template>`,
    standalone: false
})
export class TestCmp {
}

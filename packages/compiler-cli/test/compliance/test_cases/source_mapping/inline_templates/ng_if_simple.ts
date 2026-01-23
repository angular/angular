import {Component} from '@angular/core';

@Component({
    selector: 'test-cmp',
    template: '<div *ngIf="showMessage()">{{ name }}</div>',
    standalone: false
})
export class TestCmp {
}

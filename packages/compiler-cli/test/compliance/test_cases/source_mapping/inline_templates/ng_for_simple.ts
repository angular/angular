import {Component} from '@angular/core';

@Component({
    selector: 'test-cmp',
    template: '<div *ngFor="let item of items; index as i; trackBy: trackByFn">{{ item }}</div>',
    standalone: false
})
export class TestCmp {
}

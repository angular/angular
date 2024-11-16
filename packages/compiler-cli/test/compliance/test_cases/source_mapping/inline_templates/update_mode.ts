import {Component} from '@angular/core';

@Component({
    selector: 'test-cmp',
    template: '<div>this is a test</div><div>{{ 1 + 2 }}</div>',
    standalone: false
})
export class TestCmp {
}

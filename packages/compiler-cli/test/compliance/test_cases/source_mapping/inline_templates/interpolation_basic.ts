import {Component} from '@angular/core';

@Component({
    selector: 'test-cmp',
    template: '<h3>Hello {{ name }}</h3>',
    standalone: false
})
export class TestCmp {
  name: string = '';
}

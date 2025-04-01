import {Component} from '@angular/core';

@Component({
    selector: 'test-cmp',
    template: '<div id="{{name}}"></div>',
    standalone: false
})
export class TestCmp {
  name: string = '';
}

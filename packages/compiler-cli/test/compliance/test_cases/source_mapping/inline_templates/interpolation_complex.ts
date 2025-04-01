import {Component} from '@angular/core';

@Component({
    selector: 'test-cmp',
    template: '<h2>{{ greeting + " " + name }}</h2>',
    standalone: false
})
export class TestCmp {
  greeting: string = '';
  name: string = '';
}

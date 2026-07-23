import {Component} from '@angular/core';

@Component({
    selector: 'test-cmp',
    template: `
  <h3><ng-content select="title"></ng-content></h3>
  <div><ng-content></ng-content></div>`,
    standalone: false
})
export class TestCmp {
}

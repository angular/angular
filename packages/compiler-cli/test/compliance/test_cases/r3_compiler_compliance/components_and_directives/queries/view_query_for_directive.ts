import {Component, NgModule, QueryList, ViewChild, ViewChildren} from '@angular/core';

import {SomeDirective} from './some.directive';

@Component({
  selector: 'view-query-component',
  template: `
    <div someDir></div>
  `
})
export class ViewQueryComponent {
  @ViewChild(SomeDirective) someDir!: SomeDirective;
  @ViewChildren(SomeDirective) someDirs!: QueryList<SomeDirective>;
}

@NgModule({declarations: [SomeDirective, ViewQueryComponent]})
export class MyModule {
}

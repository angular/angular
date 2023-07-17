import {Component, ContentChildren, ElementRef, NgModule, QueryList, TemplateRef, ViewChildren} from '@angular/core';

import {SomeDirective} from './some.directive';

@Component({
  selector: 'content-query-component',
  template: `
    <div someDir></div>
    <div #myRef></div>
  `
})
export class ContentQueryComponent {
  @ContentChildren('myRef', {emitDistinctChangesOnly: true}) myRefs!: QueryList<ElementRef>;
  @ContentChildren('myRef', {emitDistinctChangesOnly: false}) oldMyRefs!: QueryList<ElementRef>;

  @ViewChildren(SomeDirective, {emitDistinctChangesOnly: true}) someDirs!: QueryList<any>;
  @ViewChildren(SomeDirective, {emitDistinctChangesOnly: false}) oldSomeDirs!: QueryList<any>;
}
@NgModule({declarations: [ContentQueryComponent]})
export class MyModule {
}

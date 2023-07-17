import {Component, ElementRef, NgModule, QueryList, TemplateRef, ViewChild, ViewChildren} from '@angular/core';

import {SomeDirective} from './some.directive';

@Component({
  selector: 'view-query-component',
  template: `
    <div someDir></div>
    <div #myRef></div>
    <div #myRef1></div>
  `
})
export class ViewQueryComponent {
  @ViewChild('myRef', {read: TemplateRef}) myRef!: TemplateRef<unknown>;
  @ViewChildren('myRef1, myRef2, myRef3', {read: ElementRef}) myRefs!: QueryList<ElementRef>;
  @ViewChild(SomeDirective, {read: ElementRef}) someDir!: ElementRef;
  @ViewChildren(SomeDirective, {read: TemplateRef}) someDirs!: QueryList<TemplateRef<unknown>>;
}

@NgModule({declarations: [ViewQueryComponent]})
export class MyModule {
}

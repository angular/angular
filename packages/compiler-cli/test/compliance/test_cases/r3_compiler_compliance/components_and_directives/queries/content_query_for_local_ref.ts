import {Component, ContentChild, ContentChildren, NgModule, QueryList} from '@angular/core';

@Component({
  selector: 'content-query-component',
  template: `
    <div #myRef></div>
    <div #myRef1></div>
  `
})
export class ContentQueryComponent {
  @ContentChild('myRef') myRef: any;
  @ContentChildren('myRef1, myRef2, myRef3') myRefs!: QueryList<any>;
}
@NgModule({declarations: [ContentQueryComponent]})
export class MyModule {
}

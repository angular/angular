import {Component, NgModule, QueryList, ViewChild, ViewChildren} from '@angular/core';

@Component({
  selector: 'view-query-component',
  template: `
    <div #myRef></div>
    <div #myRef1></div>
  `
})
export class ViewQueryComponent {
  @ViewChild('myRef') myRef: any;
  @ViewChildren('myRef1, myRef2, myRef3') myRefs!: QueryList<any>;
}

@NgModule({declarations: [ViewQueryComponent]})
export class MyModule {
}

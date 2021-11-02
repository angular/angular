import {Component, ContentChild, ContentChildren, NgModule, QueryList} from '@angular/core';
import {SomeDirective} from './some.directive';

@Component({
  selector: 'content-query-component',
  template: `
    <div><ng-content></ng-content></div>
  `
})
export class ContentQueryComponent {
  @ContentChild(SomeDirective) someDir!: SomeDirective;
  @ContentChildren(SomeDirective) someDirList!: QueryList<SomeDirective>;
}

@Component({
  selector: 'my-app',
  template: `
    <content-query-component>
      <div someDir></div>
    </content-query-component>
  `
})
export class MyApp {
}

@NgModule({declarations: [SomeDirective, ContentQueryComponent, MyApp]})
export class MyModule {
}

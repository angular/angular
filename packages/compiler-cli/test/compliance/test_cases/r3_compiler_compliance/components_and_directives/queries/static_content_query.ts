import {Component, ContentChild, ElementRef, NgModule} from '@angular/core';

import {SomeDirective} from './some.directive';

@Component({
    selector: 'content-query-component',
    template: `
    <div><ng-content></ng-content></div>
  `,
    standalone: false
})
export class ContentQueryComponent {
  @ContentChild(SomeDirective, {static: true}) someDir!: SomeDirective;
  @ContentChild('foo') foo!: ElementRef;
}

@Component({
    selector: 'my-app',
    template: `
    <content-query-component>
      <div someDir></div>
    </content-query-component>
  `,
    standalone: false
})
export class MyApp {
}

@NgModule({declarations: [SomeDirective, ContentQueryComponent, MyApp]})
export class MyModule {
}

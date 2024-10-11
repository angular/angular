import {Component, ContentChild, ContentChildren, Directive, forwardRef, NgModule, QueryList} from '@angular/core';

@Component({
    selector: 'content-query-component',
    template: `
    <div><ng-content></ng-content></div>
  `,
    standalone: false
})
export class ContentQueryComponent {
  @ContentChild(forwardRef(() => SomeDirective)) someDir!: SomeDirective;
  @ContentChildren(forwardRef(() => SomeDirective)) someDirList!: QueryList<SomeDirective>;
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


@Directive({
    selector: '[someDir]',
    standalone: false
})
export class SomeDirective {
}

@NgModule({declarations: [SomeDirective, ContentQueryComponent, MyApp]})
export class MyModule {
}

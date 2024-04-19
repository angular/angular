import {Component, Directive, forwardRef, NgModule, QueryList, ViewChild, ViewChildren} from '@angular/core';

@Component({
  selector: 'view-query-component',
  template: `
    <div someDir></div>
  `
})
export class ViewQueryComponent {
  @ViewChild(forwardRef(() => SomeDirective)) someDir!: SomeDirective;
  @ViewChildren(forwardRef(() => SomeDirective)) someDirList!: QueryList<SomeDirective>;
}

@Component({
  selector: 'my-app',
  template: `
    <view-query-component></view-query-component>
  `
})
export class MyApp {
}


@Directive({
  selector: '[someDir]',
})
export class SomeDirective {
}

@NgModule({declarations: [SomeDirective, ViewQueryComponent, MyApp]})
export class MyModule {
}

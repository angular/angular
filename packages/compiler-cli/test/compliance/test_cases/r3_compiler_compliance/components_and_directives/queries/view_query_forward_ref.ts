import {Component, Directive, forwardRef, NgModule, QueryList, ViewChild, ViewChildren} from '@angular/core';

@Component({
    selector: 'view-query-component',
    template: `
    <div someDir></div>
  `,
    standalone: false
})
export class ViewQueryComponent {
  @ViewChild(forwardRef(() => SomeDirective)) someDir!: SomeDirective;
  @ViewChildren(forwardRef(() => SomeDirective)) someDirList!: QueryList<SomeDirective>;
}

@Component({
    selector: 'my-app',
    template: `
    <view-query-component></view-query-component>
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

@NgModule({declarations: [SomeDirective, ViewQueryComponent, MyApp]})
export class MyModule {
}

import {Component, Directive, Input, NgModule} from '@angular/core';

@Directive({selector: '[someDirective]'})
export class SomeDirective {
  @Input() someDirective: any;
}

@Component({
  selector: 'my-component',
  template: '<ng-template [someDirective]="true"></ng-template>',
})
export class MyComponent {
}

@NgModule({declarations: [SomeDirective, MyComponent]})
export class MyModule {
}

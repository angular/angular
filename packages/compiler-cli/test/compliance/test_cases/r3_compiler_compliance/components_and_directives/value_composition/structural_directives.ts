import {Component, Directive, NgModule, TemplateRef} from '@angular/core';

@Directive({selector: '[if]'})
export class IfDirective {
  constructor(template: TemplateRef<any>) {}
}

@Component(
    {selector: 'my-component', template: '<ul #foo><li *if>{{salutation}} {{foo}}</li></ul>'})
export class MyComponent {
  salutation = 'Hello';
}

@NgModule({declarations: [IfDirective, MyComponent]})
export class MyModule {
}

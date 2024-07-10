import {Component, Directive, NgModule, TemplateRef} from '@angular/core';

@Directive({selector: '[if]'})
export class IfDirective {
  constructor(template: TemplateRef<any>) {}
}

@Component({
  selector: 'my-component',
  template: `
    <div #foo></div>
    {{foo}}
    <div *if>
      {{foo}}-{{bar}}
      <span *if>{{foo}}-{{bar}}-{{baz}}</span>
      <span #bar></span>
    </div>
    <div #baz></div>
    `
})
export class MyComponent {
}

@NgModule({declarations: [IfDirective, MyComponent]})
export class MyModule {
}

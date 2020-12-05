import {Component, Directive, Input, NgModule} from '@angular/core';

@Directive({selector: 'span'})
export class SpanDir {
  @Input() someProp!: any;
}

@Component({selector: 'custom-element', template: ''})
export class CustomEl {
  @Input() prop!: any;
  @Input() otherProp!: any;
}

@Component({
  template: `
    <button [title]="myTitle" [id]="buttonId" [tabindex]="1"></button>
    <span [id]="1" [title]="'hello'" [someProp]="1 + 2"></span>
    <custom-element [prop]="'one'" [otherProp]="2"></custom-element>
  `
})
export class MyComponent {
  myTitle = 'hello';
  buttonId = 'special-button';
}

@NgModule({declarations: [MyComponent, CustomEl, SpanDir]})
export class MyMod {
}

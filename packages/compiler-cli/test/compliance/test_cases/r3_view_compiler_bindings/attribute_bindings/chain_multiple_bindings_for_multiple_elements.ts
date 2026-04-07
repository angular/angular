import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'custom-element', template: '',
    standalone: false
})
export class CustomEl {
}

@Component({
    template: `
    <button [attr.title]="myTitle" [attr.id]="buttonId" [attr.tabindex]="1"></button>
    <span [attr.id]="1" [attr.title]="'hello'" [attr.some-attr]="1 + 2"></span>
    <custom-element [attr.some-attr]="'one'" [attr.some-other-attr]="2"></custom-element>
  `,
    standalone: false
})
export class MyComponent {
  myTitle = 'hello';
  buttonId = 'special-button';
}

@NgModule({declarations: [MyComponent, CustomEl]})
export class MyMod {
}

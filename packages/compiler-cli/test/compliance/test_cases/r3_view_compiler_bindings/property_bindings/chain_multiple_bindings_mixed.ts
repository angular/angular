import {Component, Directive, Input, NgModule} from '@angular/core';

@Directive({
    selector: 'button',
    standalone: false
})
export class ButtonDir {
  @Input('aria-label') al!: any;
}

@Component(
    {
    template: '<button [title]="1" [attr.id]="2" [tabindex]="3" aria-label="{{1 + 3}}"></button>',
    standalone: false
})
export class MyComponent {
}

@NgModule({declarations: [ButtonDir, MyComponent]})
export class MyMod {
}

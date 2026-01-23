import {Component, Directive, Input, NgModule} from '@angular/core';

@Directive({
  selector: 'button',
  standalone: false,
})
export class ButtonDir {
  @Input() label!: any;
}

@Component({
  template:
    '<button [title]="1" [id]="2" tabindex="{{0 + 3}}" label="hello-{{1 + 3}}-{{2 + 3}}"></button>',
  standalone: false,
})
export class MyComponent {}

@NgModule({declarations: [ButtonDir, MyComponent]})
export class MyMod {}

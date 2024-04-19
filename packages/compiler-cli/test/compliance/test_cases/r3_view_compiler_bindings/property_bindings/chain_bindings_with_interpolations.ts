import {Component, Directive, Input, NgModule} from '@angular/core';

@Directive({selector: 'button'})
export class ButtonDir {
  @Input('aria-label') al!: any;
}


@Component({
  template:
      '<button [title]="1" [id]="2" tabindex="{{0 + 3}}" aria-label="hello-{{1 + 3}}-{{2 + 3}}"></button>'
})
export class MyComponent {
}

@NgModule({declarations: [ButtonDir, MyComponent]})
export class MyMod {
}

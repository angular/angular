import {Component} from '@angular/core';

@Component({
  template:
      '<button [title]="1" [id]="2" tabindex="{{0 + 3}}" aria-label="hello-{{1 + 3}}-{{2 + 3}}"></button>'
})
export class MyComponent {
}

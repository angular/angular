import {Component} from '@angular/core';

@Component({
  template: `
    <button [attr.title]="1" [id]="2" [attr.tabindex]="3" attr.aria-label="prefix-{{1 + 3}}">
    </button>
  `
})
export class MyComponent {
}

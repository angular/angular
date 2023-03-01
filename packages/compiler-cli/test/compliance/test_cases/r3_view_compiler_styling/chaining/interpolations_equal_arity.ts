import {Component} from '@angular/core';

@Component({
  template: `<div
   style.color="a{{one}}b"
   style.border="a{{one}}b"
   style.transition="a{{one}}b"></div>`
})
export class MyComponent {
  one = '';
}

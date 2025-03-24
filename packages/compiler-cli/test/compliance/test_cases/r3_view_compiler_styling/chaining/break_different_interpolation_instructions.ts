import {Component} from '@angular/core';

@Component({
    template: `<div
    style.color="a{{one}}b"
    style.border="a{{one}}b"
    style.transition="a{{one}}b{{two}}c"
    style.width="a{{one}}b{{two}}c{{three}}d"
    style.height="a{{one}}b"
    style.top="a{{one}}b"></div>`,
    standalone: false
})
export class MyComponent {
  one = '';
  two = '';
  three = '';
  transition = 'all 1337ms ease';
  width = '42px';
}

import {Component} from '@angular/core';

@Component({
    template: `
    <div style.width!important="a{{one}}b{{two}}c"></div>
  `,
    standalone: false
})
export class MyComponent {
  one = '';
  two = '';
}

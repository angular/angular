import {Component} from '@angular/core';

@Component({
  template: `
    <span>Four cubed is {{ 4 ** 3 }}</span>
    <span>{{ two ** three ** 2 }} is smaller than {{ 3 ** 3 ** 2 }}</span>
    <span>My favorite number is {{ (2 ** 3 ** two + 7 - 3 * 6) / 16 }}</span>
  `,
  standalone: true,
})
export class MyApp {
  two = 2;
  three = 3;
}

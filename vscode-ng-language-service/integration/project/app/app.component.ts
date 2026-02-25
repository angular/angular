import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'my-app',
  template: `<h1>Hello {{ name }}</h1>
    <div style="co"></div>`,
  styles: [
    `
      $color: #ff0000;
      .red {
        color: $color;
        displai: block;
      }
    `,
    `
      .blue {
        color: $color;
      }
    `,
  ],
  standalone: false,
})
export class AppComponent {
  name = 'Angular';
  @Input() appInput = '';
  @Output() appOutput = new EventEmitter<string>();
}

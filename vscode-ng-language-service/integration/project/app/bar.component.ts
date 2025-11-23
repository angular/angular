import {Component} from '@angular/core';

@Component({
  selector: 'baz-component',
  template: `<h1>Hello {{name}}</h1>`,
})
export class BazComponent {
  name = 'Angular';
}

@Component({
  selector: 'bar-component',
  template: `<`,
})
export class BarComponent {
  name = 'Angular';
}

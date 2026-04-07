import {Component} from '@angular/core';

@Component({
  selector: 'baz-component',
  template: `<h1>Hello {{ name }}</h1>`,
  standalone: true,
})
export class BazComponent {
  name = 'Angular';
}

@Component({
  selector: 'bar-component',
  template: `<`,
  standalone: true,
})
export class BarComponent {
  name = 'Angular';
}

// #docregion
import {Component} from '@angular/core';

@Component({
  selector: 'app-root',
  template: '<h1>Hello {{name}}</h1>',
  standalone: false,
})
export class AppComponent {
  name = 'Angular';
}

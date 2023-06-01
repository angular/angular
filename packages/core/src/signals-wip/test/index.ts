import {Component, input} from '@angular/core';
import {bootstrapApplication} from '@angular/platform-browser';

@Component({
  selector: 'greet',
  standalone: true,
  signals: true,
  template: `{{ nameInput() }}`,
})
class Greet {
  nameInput = input('Jeff');
}

@Component({
  standalone: true,
  template: `Hello <greet [nameInput]="'Bla'" />`,
  imports: [Greet],
})
export class MyApp {
}

bootstrapApplication(MyApp).catch((e) => console.error(e));

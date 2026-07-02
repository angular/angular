import {Component} from '@angular/core';
import {Listbox, Option} from '@angular/aria/listbox';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  imports: [Listbox, Option],
})
export class App {
  amenities = ['Washer / Dryer', 'Ramp access', 'Garden', 'Cats OK', 'Dogs OK', 'Smoke-free'];
}

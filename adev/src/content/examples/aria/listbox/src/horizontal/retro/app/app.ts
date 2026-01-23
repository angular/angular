import {Listbox, Option} from '@angular/aria/listbox';
import {ChangeDetectionStrategy, Component} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  imports: [Listbox, Option],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  /** The options available in the listbox. */
  amenities = ['Washer / Dryer', 'Ramp access', 'Garden', 'Cats OK', 'Dogs OK', 'Smoke-free'];
}

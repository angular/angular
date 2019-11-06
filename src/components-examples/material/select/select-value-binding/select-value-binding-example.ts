import {Component} from '@angular/core';

/** @title Select with 2-way value binding */
@Component({
  selector: 'select-value-binding-example',
  templateUrl: 'select-value-binding-example.html',
  styleUrls: ['select-value-binding-example.css'],
})
export class SelectValueBindingExample {
  selected = 'option2';
}

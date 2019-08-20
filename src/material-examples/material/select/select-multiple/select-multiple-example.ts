import {Component} from '@angular/core';
import {FormControl} from '@angular/forms';

/** @title Select with multiple selection */
@Component({
  selector: 'select-multiple-example',
  templateUrl: 'select-multiple-example.html',
  styleUrls: ['select-multiple-example.css'],
})
export class SelectMultipleExample {
  toppings = new FormControl();
  toppingList: string[] = ['Extra cheese', 'Mushroom', 'Onion', 'Pepperoni', 'Sausage', 'Tomato'];
}

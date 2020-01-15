import {Component} from '@angular/core';

/**
 * @title List with single selection
 */
@Component({
  selector: 'list-single-selection-example',
  styleUrls: ['list-single-selection-example.css'],
  templateUrl: 'list-single-selection-example.html',
})
export class ListSingleSelectionExample {
  typesOfShoes: string[] = ['Boots', 'Clogs', 'Loafers', 'Moccasins', 'Sneakers'];
}

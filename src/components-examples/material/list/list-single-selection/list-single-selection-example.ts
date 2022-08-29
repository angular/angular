import {Component} from '@angular/core';

/**
 * @title List with single selection
 */
@Component({
  selector: 'list-single-selection-example',
  templateUrl: 'list-single-selection-example.html',
})
export class ListSingleSelectionExample {
  typesOfShoes: string[] = ['Boots', 'Clogs', 'Loafers', 'Moccasins', 'Sneakers'];
}

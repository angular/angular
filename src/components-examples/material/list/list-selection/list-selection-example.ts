import {Component} from '@angular/core';

/**
 * @title List with selection
 */
@Component({
  selector: 'list-selection-example',
  templateUrl: 'list-selection-example.html',
})
export class ListSelectionExample {
  typesOfShoes: string[] = ['Boots', 'Clogs', 'Loafers', 'Moccasins', 'Sneakers'];
}

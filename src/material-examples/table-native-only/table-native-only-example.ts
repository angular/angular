import {Component} from '@angular/core';

/**
 * @title Native `<table>` that only applies the Material styles
 */
@Component({
  selector: 'table-native-only-example',
  styleUrls: ['table-native-only-example.css'],
  templateUrl: 'table-native-only-example.html',
})
export class TableNativeOnlyExample {
  elements = [
    {position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H'},
    {position: 2, name: 'Helium', weight: 4.0026, symbol: 'He'},
    {position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li'},
    {position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be'},
    {position: 5, name: 'Boron', weight: 10.811, symbol: 'B'},
  ];
}

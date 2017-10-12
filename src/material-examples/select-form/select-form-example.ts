import {Component} from '@angular/core';

/**
 * @title Select in a form
 */
@Component({
  selector: 'select-form-example',
  templateUrl: 'select-form-example.html',
  styleUrls: ['select-form-example.css'],
})
export class SelectFormExample {
  selectedValue: string;

  foods = [
    {value: 'steak-0', viewValue: 'Steak'},
    {value: 'pizza-1', viewValue: 'Pizza'},
    {value: 'tacos-2', viewValue: 'Tacos'}
  ];
}

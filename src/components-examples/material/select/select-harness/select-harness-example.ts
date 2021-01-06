import {Component} from '@angular/core';

/**
 * @title Testing with MatSelectHarness
 */
@Component({
  selector: 'select-harness-example',
  templateUrl: 'select-harness-example.html',
})
export class SelectHarnessExample {
  foods = [
    {value: 'steak-0', viewValue: 'Steak'},
    {value: 'pizza-1', viewValue: 'Pizza'},
    {value: 'tacos-2', viewValue: 'Tacos'}
  ];
}

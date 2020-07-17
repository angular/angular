import {Component} from '@angular/core';

interface Food {
  value: string;
  viewValue: string;
}

interface Car {
  value: string;
  viewValue: string;
}

/**
 * @title Basic select with initial value and no form
 */
@Component({
  selector: 'select-initial-value-example',
  templateUrl: 'select-initial-value-example.html',
})
export class SelectInitialValueExample {
  foods: Food[] = [
    {value: 'steak-0', viewValue: 'Steak'},
    {value: 'pizza-1', viewValue: 'Pizza'},
    {value: 'tacos-2', viewValue: 'Tacos'}
  ];
  cars: Car[] = [
    {value: 'ford', viewValue: 'Ford'},
    {value: 'chevrolet', viewValue: 'Chevrolet'},
    {value: 'dodge', viewValue: 'Dodge'}
  ];
  selectedFood = this.foods[2].value;
  selectedCar = this.cars[0].value;

  selectCar(event: Event) {
    this.selectedCar = (event.target as HTMLSelectElement).value;
  }
}

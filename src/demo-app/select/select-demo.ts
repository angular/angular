import {Component} from '@angular/core';
import {FormControl} from '@angular/forms';

@Component({
    moduleId: module.id,
    selector: 'select-demo',
    templateUrl: 'select-demo.html',
    styleUrls: ['select-demo.css'],
})
export class SelectDemo {
  isRequired = false;
  isDisabled = false;
  showSelect = false;
  currentDrink: string;
  foodControl = new FormControl('pizza-1');

  foods = [
    {value: 'steak-0', viewValue: 'Steak'},
    {value: 'pizza-1', viewValue: 'Pizza'},
    {value: 'tacos-2', viewValue: 'Tacos'}
  ];

  drinks = [
    {value: 'coke-0', viewValue: 'Coke'},
    {value: 'sprite-1', viewValue: 'Sprite'},
    {value: 'water-2', viewValue: 'Water'},
    {value: 'pepper-3', viewValue: 'Dr. Pepper'},
    {value: 'coffee-4', viewValue: 'Coffee'},
    {value: 'tea-5', viewValue: 'Tea'},
    {value: 'juice-6', viewValue: 'Orange juice'},
    {value: 'wine-7', viewValue: 'Wine'},
    {value: 'milk-8', viewValue: 'Milk'},
  ];

  toggleDisabled() {
    this.foodControl.enabled ? this.foodControl.disable() : this.foodControl.enable();
  }

}

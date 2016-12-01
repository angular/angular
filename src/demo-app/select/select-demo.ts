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
  currentDrink: string;
  foodControl = new FormControl('pizza-1');

  foods = [
    {value: 'steak-0', viewValue: 'Steak'},
    {value: 'pizza-1', viewValue: 'Pizza'},
    {value: 'tacos-2', viewValue: 'Tacos'}
  ];

  drinks = [
    {value: 'coke-0', viewValue: 'Coke'},
    {value: 'sprite-1', viewValue: 'Sprite', disabled: true},
    {value: 'water-2', viewValue: 'Water'}
  ];

  toggleDisabled() {
    this.foodControl.enabled ? this.foodControl.disable() : this.foodControl.enable();
  }

}

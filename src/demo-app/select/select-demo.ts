import {Component} from '@angular/core';


@Component({
    moduleId: module.id,
    selector: 'select-demo',
    templateUrl: 'select-demo.html',
    styleUrls: ['select-demo.css'],
})
export class SelectDemo {
  foods = [
    {value: 'steak', viewValue: 'Steak'},
    {value: 'pizza', viewValue: 'Pizza'},
    {value: 'tacos', viewValue: 'Tacos'}
  ];
}

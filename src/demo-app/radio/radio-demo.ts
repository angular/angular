import {Component} from '@angular/core';


@Component({
  moduleId: module.id,
  selector: 'radio-demo',
  templateUrl: 'radio-demo.html',
  styleUrls: ['radio-demo.css'],
})
export class RadioDemo {
  isDisabled: boolean = false;
  isAlignEnd: boolean = false;
  favoriteSeason: string = 'Autumn';
  seasonOptions = [
    'Winter',
    'Spring',
    'Summer',
    'Autumn',
  ];
}

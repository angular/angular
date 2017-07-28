import {Component} from '@angular/core';


@Component({
  moduleId: module.id,
  selector: 'radio-a11y',
  templateUrl: 'radio-a11y.html',
  styleUrls: ['radio-a11y.css'],
})
export class RadioAccessibilityDemo {
  favoriteSeason: string = 'Autumn';
  seasonOptions = [
    'Winter',
    'Spring',
    'Summer',
    'Autumn',
  ];
}

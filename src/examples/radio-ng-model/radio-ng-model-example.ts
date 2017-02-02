import {Component} from '@angular/core';


@Component({
  selector: 'radio-ng-model-example',
  templateUrl: './radio-ng-model-example.html',
  styleUrls: ['./radio-ng-model-example.css'],
})
export class RadioNgModelExample {
  favoriteSeason: string;

  seasons = [
    'Winter',
    'Spring',
    'Summer',
    'Autumn',
  ];
}

import {Component} from '@angular/core';
import {MdRadioButton, MdRadioGroup} from '../../components/radio/radio';
import {MdRadioDispatcher} from '../../components/radio/radio_dispatcher';

@Component({
  selector: 'radio-demo',
  templateUrl: 'demo-app/radio/radio-demo.html',
  styleUrls: ['demo-app/radio/radio-demo.css'],
  providers: [MdRadioDispatcher],
  directives: [MdRadioButton, MdRadioGroup]
})
export class RadioDemo {
  isDisabled: boolean = false;
  favoriteSeason: string = 'Autumn';
  seasonOptions = [
    'Winter',
    'Spring',
    'Summer',
    'Autumn',
  ];
}

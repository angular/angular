import {Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HousingLocationInfo} from '../housinglocation';
@Component({
  selector: 'app-housing-location',
  imports: [CommonModule],
  template: `
    <p>housing-location works!</p>
  `,
  styleUrls: ['./housing-location.css'],
})
export class HousingLocation {
  @Input() housingLocation!: HousingLocationInfo;
}

import {Component} from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'slider-a11y',
  templateUrl: 'slider-a11y.html',
  styleUrls: ['slider-a11y.css'],
})
export class SliderAccessibilityDemo {
  red = 0;
  green = 0;
  blue = 0;

  get swatchBackground() {
    return `rgb(${this.red}, ${this.green}, ${this.blue})`;
  }
}

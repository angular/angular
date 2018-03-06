import {Component} from '@angular/core';

/**
 * @title Slider with custom thumb label formatting.
 */
@Component({
  selector: 'slider-formatting-example',
  templateUrl: 'slider-formatting-example.html',
  styleUrls: ['slider-formatting-example.css'],
})
export class SliderFormattingExample {
  formatLabel(value: number | null) {
    if (!value) {
      return 0;
    }

    if (value >= 1000) {
      return Math.round(value / 1000) + 'k';
    }

    return value;
  }
}

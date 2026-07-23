import {Component} from '@angular/core';
import {StatusSlider} from './status-slider';

@Component({
  selector: 'app-status-slider-page',
  template: `
    <section>
      <h2>Status Slider</h2>
      <app-status-slider />
    </section>
  `,
  imports: [StatusSlider],
})
export class StatusSliderPage {}

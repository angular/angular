import {Component} from '@angular/core';
import {StatusSliderComponent} from './status-slider.component';

@Component({
  selector: 'app-status-slider-page',
  template: `
    <section>
      <h2>Status Slider</h2>
      <app-status-slider></app-status-slider>
    </section>
  `,
  imports: [StatusSliderComponent],
})
export class StatusSliderPageComponent {}

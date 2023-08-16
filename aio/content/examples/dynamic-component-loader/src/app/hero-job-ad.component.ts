// #docregion
import { Component, Input } from '@angular/core';

import { AdComponent } from './ad.component';

@Component({
  standalone: true,
  template: `
    <div class="job-ad">
      <h4>{{data.headline}}</h4>
      {{data.body}}
    </div>
  `
})
export class HeroJobAdComponent implements AdComponent {
  @Input() data: any;
}


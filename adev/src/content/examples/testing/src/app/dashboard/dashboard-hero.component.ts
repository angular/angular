// #docregion
import {Component, input, output} from '@angular/core';
import {UpperCasePipe} from '@angular/common';

import {Hero} from '../model/hero';

// #docregion component
@Component({
  selector: 'dashboard-hero',
  template: `
    <button type="button" (click)="click()" class="hero">
      {{ hero().name | uppercase }}
    </button>
  `,
  styleUrls: ['./dashboard-hero.component.css'],
  imports: [UpperCasePipe],
})
// #docregion class
export class DashboardHeroComponent {
  hero = input.required<Hero>();
  selected = output<Hero>();
  click() {
    this.selected.emit(this.hero());
  }
}
// #enddocregion component, class

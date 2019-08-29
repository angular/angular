// #docregion
import { Component, EventEmitter, Input, Output } from '@angular/core';

import { Hero } from '../model/hero';

// #docregion component
@Component({
  selector: 'dashboard-hero',
  template: `
    <div (click)="click()" class="hero">
      {{hero.name | uppercase}}
    </div>`,
  styleUrls: [ './dashboard-hero.component.css' ]
})
// #docregion class
export class DashboardHeroComponent {
  @Input() hero: Hero;
  @Output() selected = new EventEmitter<Hero>();
  click() { this.selected.emit(this.hero); }
}
// #enddocregion component, class

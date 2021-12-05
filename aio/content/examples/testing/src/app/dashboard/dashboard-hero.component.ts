// #docregion
import { Component, EventEmitter, Input, Output } from '@angular/core';

import { Hero } from '../model/hero';

// #docregion component
@Component({
  selector: 'dashboard-hero',
  template: `
    <!-- eslint-disable-next-line @angular-eslint/template/click-events-have-key-events -->
    <div (click)="click()" class="hero"> <!--eslint-disable-line-->
      {{hero.name | uppercase}}
    </div>`,
  styleUrls: [ './dashboard-hero.component.css' ]
})
// #docregion class
export class DashboardHeroComponent {
  @Input() hero!: Hero;
  @Output() selected = new EventEmitter<Hero>();
  click() { this.selected.emit(this.hero); }
}
// #enddocregion component, class

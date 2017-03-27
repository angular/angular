import { Component, Input } from '@angular/core';
import { Hero } from './hero';

// #docregion stylelink
@Component({
  selector: 'hero-team',
  template: `
    <link rel="stylesheet" href="app/hero-team.component.css">
    <h3>Team</h3>
    <ul>
      <li *ngFor="let member of hero.team">
        {{member}}
      </li>
    </ul>`
})
// #enddocregion stylelink
export class HeroTeamComponent {
  @Input() hero: Hero;
}

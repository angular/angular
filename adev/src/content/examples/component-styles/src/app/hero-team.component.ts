import {Component, Input} from '@angular/core';
import {Hero} from './hero';

// #docregion stylelink
@Component({
  selector: 'app-hero-team',
  template: `
    <!-- We must use a relative URL so that the AOT compiler can find the stylesheet -->
    <link rel="stylesheet" href="../assets/hero-team.component.css">
    <h3>Team</h3>
    <ul>
      @for (member of hero.team; track member) {
        <li>
          {{member}}
        </li>
      }
    </ul>`,
})
// #enddocregion stylelink
export class HeroTeamComponent {
  @Input() hero!: Hero;
}

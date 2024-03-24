// #docregion
import {Component} from '@angular/core';

// #docregion little-tour
@Component({
  standalone: true,
  selector: 'app-little-tour',
  template: `
    <input
      #newHero
      (keyup.enter)="addHero(newHero.value)"
      (blur)="addHero(newHero.value); newHero.value = ''"
    />

    <button type="button" (click)="addHero(newHero.value)">Add</button>

    <ul>
      @for (hero of heroes; track hero) {
        <li>{{ hero }}</li>
      }
    </ul>
  `,
  imports: [],
})
export class LittleTourComponent {
  heroes = ['Windstorm', 'Bombasto', 'Magneta', 'Tornado'];
  addHero(newHero: string) {
    if (newHero) {
      this.heroes.push(newHero);
    }
  }
}
// #enddocregion little-tour

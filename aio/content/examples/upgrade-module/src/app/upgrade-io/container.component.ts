// #docregion
import { Component } from '@angular/core';
import { Hero } from '../hero';

@Component({
  selector: 'my-container',
  template: `
    <h1>Tour of Heroes</h1>
    <hero-detail [hero]="hero"
                 (deleted)="heroDeleted($event)">
    </hero-detail>
  `
})
export class ContainerComponent {
  hero = new Hero(1, 'Windstorm');
  heroDeleted(hero: Hero) {
    hero.name = 'Ex-' + hero.name;
  }
}

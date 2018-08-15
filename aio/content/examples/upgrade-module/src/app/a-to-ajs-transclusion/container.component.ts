// #docregion
import { Component } from '@angular/core';
import { Hero } from '../hero';

@Component({
  selector: 'my-container',
  template: `
    <hero-detail [hero]="hero">
      <!-- Everything here will get transcluded -->
      <p>{{hero.description}}</p>
    </hero-detail>
  `
})
export class ContainerComponent {
  hero = new Hero(1, 'Windstorm', 'Specific powers of controlling winds');
}

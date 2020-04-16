// #docregion
import { Component } from '@angular/core';
import { Hero } from '../hero';

@Component({
  selector: 'my-container',
  template: `
    <hero-detail [hero]="hero">
      <!-- 이 부분에 있는 엘리먼트들이 트랜스클루전 됩니다. -->
      <p>{{hero.description}}</p>
    </hero-detail>
  `
})
export class ContainerComponent {
  hero = new Hero(1, 'Windstorm', 'Specific powers of controlling winds');
}

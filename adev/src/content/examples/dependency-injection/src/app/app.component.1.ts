// #docregion
import {Component} from '@angular/core';
import {CarComponent} from './car/car.component';
import {HeroesComponent} from './heroes/heroes.component';

@Component({
  selector: 'app-root',
  template: `
    <h1>{{title}}</h1>
    <app-car></app-car>
    <app-heroes></app-heroes>
  `,
  imports: [CarComponent, HeroesComponent],
})
export class AppComponent {
  title = 'Dependency Injection';
}

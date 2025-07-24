import {Component, Inject} from '@angular/core';

import {APP_CONFIG, AppConfig} from './injection.config';
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
  title: string;

  // #docregion ctor
  constructor(@Inject(APP_CONFIG) config: AppConfig) {
    this.title = config.title;
  }
  // #enddocregion ctor
}

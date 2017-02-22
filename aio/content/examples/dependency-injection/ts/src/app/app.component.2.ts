// #docregion
// #docregion imports
import { Component }         from '@angular/core';
import { Inject }   from '@angular/core';

import { APP_CONFIG, AppConfig }    from './app.config';
// #enddocregion imports

@Component({
  selector: 'my-app',
  template: `
    <h1>{{title}}</h1>
    <my-car></my-car>
    <my-heroes></my-heroes>
  `
})
export class AppComponent {
  title: string;

  // #docregion ctor
  constructor(@Inject(APP_CONFIG) config: AppConfig) {
    this.title = config.title;
  }
  // #enddocregion ctor
}

import { Component, Inject } from '@angular/core';

import { APP_CONFIG, AppConfig } from './app.config';

@Component({
  selector: 'app-root',
  template: `
    <h1>{{title}}</h1>
    <app-car></app-car>
    <app-heroes></app-heroes>
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

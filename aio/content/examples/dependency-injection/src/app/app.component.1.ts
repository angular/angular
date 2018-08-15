// #docregion
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <h1>{{title}}</h1>
    <app-car></app-car>
    <app-heroes></app-heroes>
  `
})

export class AppComponent {
  title = 'Dependency Injection';
}

import { Component } from '@angular/core';
import {
  FavoriteColorComponent as ReactiveFavoriteColorComponent
} from './reactive/favorite-color/favorite-color.component';
import {
  FavoriteColorComponent as TemplateFavoriteColorComponent
} from './template/favorite-color/favorite-color.component';

@Component({
  standalone: true,
  selector: 'app-root',
  template: `
    <h1>Forms Overview</h1>
    <h2>Reactive</h2>
    <app-reactive-favorite-color></app-reactive-favorite-color>
    <h2>Template-Driven</h2>
    <app-template-favorite-color></app-template-favorite-color>
  `,
  styles: [],
  imports: [ReactiveFavoriteColorComponent, TemplateFavoriteColorComponent],
})
export class AppComponent {}

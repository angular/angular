import {Component} from '@angular/core';

@Component({
  selector: 'app-template-favorite-color',
  template: `
    Favorite Color: <input type="text" [(ngModel)]="favoriteColor">
  `,
  standalone: false,
})
export class FavoriteColorComponent {
  favoriteColor = '';
}

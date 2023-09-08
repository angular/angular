import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-template-favorite-color',
  template: `
    Favorite Color: <input type="text" [(ngModel)]="favoriteColor" />
  `,
  imports: [FormsModule],
})
export class FavoriteColorComponent {
  favoriteColor = '';
}

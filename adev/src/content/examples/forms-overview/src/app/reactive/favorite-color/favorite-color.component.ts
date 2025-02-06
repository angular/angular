import {Component} from '@angular/core';
import {FormControl, ReactiveFormsModule} from '@angular/forms';

@Component({
  selector: 'app-reactive-favorite-color',
  template: `
    Favorite Color: <input type="text" [formControl]="favoriteColorControl">
  `,
  imports: [ReactiveFormsModule],
  standalone: false,
})
export class FavoriteColorComponent {
  favoriteColorControl = new FormControl('');
}

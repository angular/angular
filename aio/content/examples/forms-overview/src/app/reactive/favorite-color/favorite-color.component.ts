import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-reactive-favorite-color',
  template: `
    Favorite Color: <input type="text" [formControl]="favoriteColor">
  `,
  styles: []
})
export class FavoriteColorComponent implements OnInit {
  favoriteColor = new FormControl('');

  constructor() { }

  ngOnInit() {
  }

}

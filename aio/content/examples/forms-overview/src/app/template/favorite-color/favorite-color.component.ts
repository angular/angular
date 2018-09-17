import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-template-favorite-color',
  template: `
    Favorite Color: <input type="text" [(ngModel)]="favoriteColor">
  `,
  styles: []
})
export class FavoriteColorComponent implements OnInit {
  favoriteColor = '';

  constructor() { }

  ngOnInit() {
  }

}

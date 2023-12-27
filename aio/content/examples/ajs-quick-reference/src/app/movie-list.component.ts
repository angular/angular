// #docplaster
import { Component } from '@angular/core';
import {
  NgFor, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault,
  CurrencyPipe, DatePipe, DecimalPipe, PercentPipe, UpperCasePipe
} from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IMovie } from './movie';
import { MovieService } from './movie.service';

// #docregion component
@Component({
  standalone: true,
  selector: 'app-movie-list',
  templateUrl: './movie-list.component.html',
  imports: [
    FormsModule,
    NgFor, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault,
    CurrencyPipe, DatePipe, DecimalPipe, PercentPipe, UpperCasePipe
  ],
// #docregion style-url
  styleUrls: [ './movie-list.component.css' ],
// #enddocregion style-url
})
// #enddocregion component
// #docregion class
export class MovieListComponent {
// #enddocregion class
  favoriteHero: string | undefined;
  showImage = false;
  movies: IMovie[];

// #docregion di
  constructor(movieService: MovieService) {
// #enddocregion di
    this.movies = movieService.getMovies();
// #docregion di
  }
// #enddocregion di

  toggleImage(): void {
    this.showImage = !this.showImage;
  }

  checkMovieHero(value: string): boolean {
    return this.movies.filter(movie => movie.hero === value).length > 0 ;
  }
// #docregion class
}
// #enddocregion class

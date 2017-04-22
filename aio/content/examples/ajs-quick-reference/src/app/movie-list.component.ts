/* tslint:disable:no-unused-variable */
// #docplaster
// #docregion import
import { Component } from '@angular/core';
// #enddocregion import
import { IMovie } from './movie';
import { MovieService } from './movie.service';

// #docregion component
@Component({
  selector: 'movie-list',
  templateUrl: './movie-list.component.html',
// #docregion style-url
  styleUrls: [ './movie-list.component.css' ],
// #enddocregion style-url
})
// #enddocregion component
// #docregion class
export class MovieListComponent {
// #enddocregion class
  favoriteHero: string;
  showImage: boolean = false;
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

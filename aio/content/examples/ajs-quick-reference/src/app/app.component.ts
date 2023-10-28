import { Component } from '@angular/core';
import {
  NgFor, NgIf, NgClass, NgStyle,
  CurrencyPipe, DatePipe, DecimalPipe, JsonPipe, LowerCasePipe, PercentPipe, SlicePipe, UpperCasePipe
} from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterOutlet} from '@angular/router';

import { MovieService } from './movie.service';
import { IMovie } from './movie';

@Component({
  standalone: true,
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [
    FormsModule,
    NgFor, NgIf, NgClass, NgStyle,
    CurrencyPipe, DatePipe, DecimalPipe, JsonPipe, LowerCasePipe, PercentPipe, SlicePipe, UpperCasePipe,
    RouterLink, RouterOutlet
  ],
  styleUrls: [ './app.component.css' ]
})
export class AppComponent {

  angularDocsUrl = 'https://angular.io/';
  colorPreference = 'red';
  eventType = '<not clicked yet>';
  isActive = true;
  isImportant = true;
  movie: IMovie;
  movies: IMovie[] = [];
  showImage = true;
  title = 'AngularJS to Angular Quick Ref Cookbook';
  toggleImage(event?: UIEvent) {
    this.showImage = !this.showImage;
    this.eventType = (event && event.type) || 'not provided';
  }

  constructor(movieService: MovieService) {
    this.movies = movieService.getMovies();
    this.movie = this.movies[0];
  }
}

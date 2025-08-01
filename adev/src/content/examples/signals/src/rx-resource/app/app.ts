import {Component, inject} from '@angular/core';
import {Movie} from './movie';

@Component({
  selector: 'app-move-list',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class MovieList {
  protected readonly movieService = inject(Movie);
}

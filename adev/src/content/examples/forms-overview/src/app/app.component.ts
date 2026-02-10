import {Component} from '@angular/core';
import {FavoriteColorReactive} from './reactive/favorite-color/favorite-color.component';
import {FavoriteColorTemplate} from './template/favorite-color/favorite-color.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [FavoriteColorTemplate, FavoriteColorReactive],
})
export class AppComponent {
  title = 'forms-intro';
}

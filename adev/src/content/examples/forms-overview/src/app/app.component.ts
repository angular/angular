import {Component} from '@angular/core';
import {FavoriteColorReactiveComponent} from './reactive/favorite-color/favorite-color.component';
import {FavoriteColorTemplateComponent} from './template/favorite-color/favorite-color.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [FavoriteColorTemplateComponent, FavoriteColorReactiveComponent],
})
export class AppComponent {
  title = 'forms-intro';
}

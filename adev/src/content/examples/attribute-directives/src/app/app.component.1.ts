import {Component} from '@angular/core';
import {HighlightDirective} from './highlight.directive';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.1.html',
  imports: [HighlightDirective],
})
// #docregion class
export class AppComponent {
  color = 'yellow';
}

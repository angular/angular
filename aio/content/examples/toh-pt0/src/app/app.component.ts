import {Component} from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  // #docregion set-title
  title = 'Tour of Heroes';
  // #enddocregion set-title
}

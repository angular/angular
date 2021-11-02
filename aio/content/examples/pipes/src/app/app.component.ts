// #docregion
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styles: ['a[href] {display: block; padding: 10px 0;}', 'a:hover {text-decoration: none;}', 'h2 {margin: 0;}']
})
export class AppComponent {
  birthday = new Date(1988, 3, 15); // April 15, 1988 -- since month parameter is zero-based
}

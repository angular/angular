// #docregion
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  birthday = new Date(1988, 4, 15); // April 15, 1988
}

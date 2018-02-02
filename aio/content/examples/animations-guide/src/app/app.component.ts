// #docregion imports
import {Component} from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition,
  //...
} from '@angular/animations';
// #enddocregion imports

// #docregion decorator
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.css'],
  animations: [
    // animation triggers go here
  ]
})
// #enddocregion decorator
export class AppComponent {
}

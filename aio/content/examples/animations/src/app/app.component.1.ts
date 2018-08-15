// #docplaster
// #docregion imports
import { Component, HostBinding } from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition,
  // ...
} from '@angular/animations';

// #enddocregion imports

// #docregion decorator, toggle-app-animations
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
  @HostBinding('@.disabled')
  public animationsDisabled = false;
// #enddocregion toggle-app-animations

  toggleAnimations() {
    this.animationsDisabled = !this.animationsDisabled;
  }
// #docregion toggle-app-animations
}
// #enddocregion toggle-app-animations

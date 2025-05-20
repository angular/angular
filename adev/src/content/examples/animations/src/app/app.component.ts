// #docplaster
// #docregion imports
import {Component, HostBinding, inject} from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition,
  // ...
} from '@angular/animations';

// #enddocregion imports
import {ChildrenOutletContexts, RouterLink, RouterOutlet} from '@angular/router';
import {slideInAnimation} from './animations';

// #docregion decorator, toggle-app-animations, define
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.css'],
  imports: [RouterLink, RouterOutlet],
  animations: [
    // #enddocregion decorator
    slideInAnimation,
    // #docregion decorator
    // #enddocregion toggle-app-animations, define
    // animation triggers go here
    // #docregion toggle-app-animations, define
  ],
})
// #enddocregion decorator, define
export class AppComponent {
  @HostBinding('@.disabled')
  public animationsDisabled = false;
  // #enddocregion toggle-app-animations

  // #docregion get-route-animations-data
  private contexts = inject(ChildrenOutletContexts);

  getRouteAnimationData() {
    return this.contexts.getContext('primary')?.route?.snapshot?.data?.['animation'];
  }
  // #enddocregion get-route-animations-data

  toggleAnimations() {
    this.animationsDisabled = !this.animationsDisabled;
  }
  // #docregion toggle-app-animations
}
// #enddocregion toggle-app-animations

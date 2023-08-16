// #docplaster
import { Component, HostBinding } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.css'],
  animations: [
    // animation triggers go here
  ]
})
export class AppComponent {
  @HostBinding('@.disabled') public animationsDisabled = false;

  toggleAnimations() {
    this.animationsDisabled = !this.animationsDisabled;
  }
}

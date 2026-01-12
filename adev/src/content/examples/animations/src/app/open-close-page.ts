import {Component} from '@angular/core';
import {OpenClose} from './open-close';

@Component({
  selector: 'app-open-close-page',
  template: `
    <section>
      <h2>Open Close Component</h2>
      <input type="checkbox" id="log-checkbox" [checked]="logging" (click)="toggleLogging()" />
      <label for="log-checkbox">Console Log Animation Events</label>

      <app-open-close [logging]="logging"></app-open-close>
    </section>
  `,
  imports: [OpenClose],
})
export class OpenClosePage {
  logging = false;

  toggleLogging() {
    this.logging = !this.logging;
  }
}

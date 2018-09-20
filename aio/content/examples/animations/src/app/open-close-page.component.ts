import { Component } from '@angular/core';

@Component({
  selector: 'app-open-close-page',
  template: `
    <section>
      <h2>Open Close Component</h2>
      <input type="checkbox" [checked]="logging" (click)="toggleLogging()"/> Console Log Animation Events

      <app-open-close [logging]="logging"></app-open-close>
    </section>
  `
})
export class OpenClosePageComponent {
  logging = false;

  toggleLogging() {
    this.logging = !this.logging;
  }
}

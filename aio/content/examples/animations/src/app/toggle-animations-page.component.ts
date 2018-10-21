import { Component } from '@angular/core';

@Component({
  selector: 'app-toggle-animations-child-page',
  template: `
    <section>
      <h2>Toggle Animations</h2>

      <app-open-close-toggle></app-open-close-toggle>
    </section>
  `
})
export class ToggleAnimationsPageComponent {}

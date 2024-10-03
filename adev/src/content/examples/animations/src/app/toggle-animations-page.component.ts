import {Component} from '@angular/core';
import {OpenCloseChildComponent} from './open-close.component.4';

@Component({
  selector: 'app-toggle-animations-child-page',
  template: `
    <section>
      <h2>Toggle Animations</h2>

      <app-open-close-toggle></app-open-close-toggle>
    </section>
  `,
  imports: [OpenCloseChildComponent],
})
export class ToggleAnimationsPageComponent {}

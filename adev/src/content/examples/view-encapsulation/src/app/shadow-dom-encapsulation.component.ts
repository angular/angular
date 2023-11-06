import {Component, ViewEncapsulation} from '@angular/core';
import {NoEncapsulationComponent} from './no-encapsulation.component';
import {EmulatedEncapsulationComponent} from './emulated-encapsulation.component';

// #docregion
@Component({
  standalone: true,
  selector: 'app-shadow-dom-encapsulation',
  template: `
    <h2>ShadowDom</h2>
    <div class="shadow-message">Shadow DOM encapsulation</div>
    <app-emulated-encapsulation></app-emulated-encapsulation>
    <app-no-encapsulation></app-no-encapsulation>
  `,
  styles: ['h2, .shadow-message { color: blue; }'],
  encapsulation: ViewEncapsulation.ShadowDom,
  imports: [NoEncapsulationComponent, EmulatedEncapsulationComponent],
})
export class ShadowDomEncapsulationComponent {}

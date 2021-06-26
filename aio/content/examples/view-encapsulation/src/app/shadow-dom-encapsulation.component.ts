import { Component, ViewEncapsulation } from '@angular/core';

// #docregion
@Component({
  selector: 'app-shadow-dom-encapsulation',
  template: `
    <h2 class="shadow-header">ShadowDom</h2>
    <div class="shadow-message">Shadow DOM encapsulation</div>
    <app-emulated-encapsulation></app-emulated-encapsulation>
    <app-no-encapsulation></app-no-encapsulation>
  `,
  styles: ['.shadow-header, .shadow-message { color: blue; }'],
  encapsulation: ViewEncapsulation.ShadowDom,
})
export class ShadowDomEncapsulationComponent { }

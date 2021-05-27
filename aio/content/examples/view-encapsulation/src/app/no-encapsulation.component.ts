import { Component, ViewEncapsulation } from '@angular/core';

// #docregion
@Component({
  selector: 'app-no-encapsulation',
  template: `
    <h2>None</h2>
    <div class="message">No encapsulation</div>
  `,
  styles: ['h2, .message { color: red; }'],
  encapsulation: ViewEncapsulation.None,
})
export class NoEncapsulationComponent { }

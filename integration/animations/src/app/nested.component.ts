import {Component, signal, ViewEncapsulation} from '@angular/core';

@Component({
  selector: 'app-nested-child',
  template: `<div class="child-target" animate.leave="child-leave">Child</div>`,
  styles: [
    `
      .child-leave {
        animation: test-leave 800ms;
      }
    `,
  ],
  encapsulation: ViewEncapsulation.None,
})
export class NestedChildComponent {}

@Component({
  selector: 'app-nested',
  imports: [NestedChildComponent],
  template: `
    <h2>Nested Animations</h2>
    @if (show()) {
      <div class="nested-parent">
        <app-nested-child></app-nested-child>
      </div>
    }
    <ng-container>
      <app-nested-child></app-nested-child>
    </ng-container>
    <button id="toggle-nested" (click)="show.set(!show())">Toggle</button>
  `,
  styles: [
    `
      @keyframes test-leave {
        from {
          opacity: 1;
        }
        to {
          opacity: 0;
        }
      }
    `,
  ],
  encapsulation: ViewEncapsulation.None,
})
export class NestedComponent {
  show = signal(true);
}

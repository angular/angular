/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// #docregion Component
import {Component, contentChild, Directive, input, signal} from '@angular/core';

@Directive({
  selector: 'pane',
  standalone: false,
})
export class Pane {
  id = input.required<string>();
}

@Component({
  selector: 'tab',
  template: ` <div>pane: {{ pane()?.id() }}</div> `,
  standalone: false,
})
export class Tab {
  pane = contentChild(Pane);
}

@Component({
  selector: 'example-app',
  template: `
    <tab>
      @if(shouldShow()) {
        <pane id="1"/>
      } @else { 
        <pane id="2"/>
      }
    </tab>

    <button (click)="toggle()">Toggle</button>
  `,
  standalone: false,
})
export class ContentChildComp {
  shouldShow = signal(true);

  toggle() {
    this.shouldShow.update((shouldShow) => !shouldShow);
  }
}
// #enddocregion

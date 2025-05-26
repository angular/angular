/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// #docregion Component
import {Component, Directive, input, signal, ViewChild} from '@angular/core';

@Directive({
  selector: 'pane',
  standalone: false,
})
export class Pane {
  id = input.required<string>();
}

@Component({
  selector: 'example-app',
  template: `
    @if(shouldShow()) {
      <pane id="1"/>
    } @else {
      <pane id="2"/>
    }

    <button (click)="toggle()">Toggle</button>

    <div>Selected: {{ selectedPane() }}</div>
  `,
  standalone: false,
})
export class ViewChildComp {
  @ViewChild(Pane)
  set pane(v: Pane) {
    setTimeout(() => {
      this.selectedPane.set(v.id());
    }, 0);
  }
  selectedPane = signal('');
  shouldShow = signal(true);
  toggle() {
    this.shouldShow.update((shouldShow) => !shouldShow);
  }
}
// #enddocregion

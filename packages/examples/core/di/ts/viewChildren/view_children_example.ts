/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// #docregion Component
import {
  AfterViewInit,
  Component,
  Directive,
  input,
  QueryList,
  signal,
  ViewChildren,
} from '@angular/core';

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
    <pane id="1"/>
    <pane id="2"/>
    @if(shouldShow()) {
      <pane id="3"/>
    }

    <button (click)="show()">Show 3</button>

    <div>panes: {{ serializedPanes }}</div>
  `,
  standalone: false,
})
export class ViewChildrenComp implements AfterViewInit {
  @ViewChildren(Pane) panes!: QueryList<Pane>;
  serializedPanes: string = '';

  shouldShow = signal(false);

  show() {
    this.shouldShow.set(true);
  }

  ngAfterViewInit() {
    this.calculateSerializedPanes();
    this.panes.changes.subscribe(() => {
      this.calculateSerializedPanes();
    });
  }

  calculateSerializedPanes() {
    setTimeout(() => {
      this.serializedPanes = this.panes.map((p) => p.id()).join(', ');
    }, 0);
  }
}
// #enddocregion

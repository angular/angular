/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// #docregion Component
import {Component, ContentChildren, Directive, input, QueryList, signal} from '@angular/core';

@Directive({
  selector: 'pane',
  standalone: false,
})
export class Pane {
  id = input.required<string>();
}

@Component({
  selector: 'tab',
  template: `
    <div class="top-level">Top level panes: {{ serializedPanes }}</div>
    <div class="nested">Arbitrary nested panes: {{ serializedNestedPanes }}</div>
  `,
  standalone: false,
})
export class Tab {
  @ContentChildren(Pane) topLevelPanes!: QueryList<Pane>;
  @ContentChildren(Pane, {descendants: true}) arbitraryNestedPanes!: QueryList<Pane>;

  get serializedPanes(): string {
    return this.topLevelPanes ? this.topLevelPanes.map((p) => p.id()).join(', ') : '';
  }
  get serializedNestedPanes(): string {
    return this.arbitraryNestedPanes ? this.arbitraryNestedPanes.map((p) => p.id()).join(', ') : '';
  }
}

@Component({
  selector: 'example-app',
  template: `
    <tab>
      <pane id="1"></pane>
      <pane id="2"></pane>
      @if(shouldShow()) {
        <pane id="3">
          <tab>
            <pane id="3_1"></pane>
            <pane id="3_2"></pane>
          </tab>
        </pane>
      }
    </tab>

    <button (click)="show()">Show 3</button>
  `,
  standalone: false,
})
export class ContentChildrenComp {
  shouldShow = signal(false);

  show() {
    this.shouldShow.set(true);
  }
}
// #enddocregion

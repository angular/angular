/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// #docregion Component
import {Component, ContentChildren, Directive, Input, QueryList} from '@angular/core';

@Directive({selector: 'pane'})
export class Pane {
  @Input() id: string;
}

@Component({
  selector: 'tab',
  template: `
    <div>panes: {{serializedPanes}}</div>
    <div>allPanes: {{serializedAllPanes}}</div>
  `
})
export class Tab {
  @ContentChildren(Pane) panes: QueryList<Pane>;
  @ContentChildren(Pane, { descendants: true }) allPanes: QueryList<Pane>;

  get serializedPanes(): string { return this.panes ? this.panes.map(p => p.id).join(', ') : ''; }
  get serializedAllPanes(): string { return this.allPanes ? this.allPanes.map(p => p.id).join(', ') : ''; }
}

@Component({
  selector: 'example-app',
  template: `
    <tab>
      <pane id="1"></pane>
      <pane id="2"></pane>
      <pane id="3" *ngIf="shouldShow">
        <tab>
          <pane id="3_1"></pane>
          <pane id="3_2"></pane>
        </tab>
      </pane>
    </tab>
    
    <button (click)="show()">Show 3</button>
  `,
})
export class ContentChildrenComp {
  shouldShow = false;

  show() { this.shouldShow = true; }
}
// #enddocregion

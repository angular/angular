/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// #docregion Component
import {Component, ContentChild, Directive, Input} from '@angular/core';

@Directive({
  selector: 'pane',
  standalone: false,
})
export class Pane {
  @Input() id!: string;
}

@Component({
  selector: 'tab',
  template: ` <div>pane: {{ pane.id }}</div> `,
  standalone: false,
})
export class Tab {
  @ContentChild(Pane) pane!: Pane;
}

@Component({
  selector: 'example-app',
  template: `
    <tab>
      <pane id="1" *ngIf="shouldShow"></pane>
      <pane id="2" *ngIf="!shouldShow"></pane>
    </tab>

    <button (click)="toggle()">Toggle</button>
  `,
  standalone: false,
})
export class ContentChildComp {
  shouldShow = true;

  toggle() {
    this.shouldShow = !this.shouldShow;
  }
}
// #enddocregion

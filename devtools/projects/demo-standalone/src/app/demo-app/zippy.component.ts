/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-zippy',
  styles: [
    `
      :host {
        user-select: none;
      }

      header {
        max-width: 120px;
        border: 1px solid #ccc;
        padding-left: 10px;
        padding-right: 10px;
        cursor: pointer;
      }

      div {
        max-width: 120px;
        border-left: 1px solid #ccc;
        border-right: 1px solid #ccc;
        border-bottom: 1px solid #ccc;
        padding: 10px;
      }
    `,
  ],
  template: `
    <section>
      <header (click)="visible = !visible">{{ title }}</header>
      <div [hidden]="!visible">
        <ng-content></ng-content>
      </div>
    </section>
  `,
})
export class ZippyComponent {
  @Input() title!: string;
  visible = false;
}

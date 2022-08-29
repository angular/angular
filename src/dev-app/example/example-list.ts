/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BooleanInput, coerceBooleanProperty} from '@angular/cdk/coercion';
import {CommonModule} from '@angular/common';
import {EXAMPLE_COMPONENTS} from '@angular/components-examples';
import {Component, Input} from '@angular/core';
import {MatExpansionModule} from '@angular/material/expansion';
import {Example} from './example';

/** Displays a set of components-examples in a mat-accordion. */
@Component({
  selector: 'material-example-list',
  standalone: true,
  imports: [CommonModule, MatExpansionModule, Example],
  template: `
    <mat-accordion multi>
      <mat-expansion-panel *ngFor="let id of ids" [expanded]="expandAll">
        <mat-expansion-panel-header>
          <div class="header">
            <div class="title">{{_getTitle(id)}}</div>
            <div class="id"> <{{id}}> </div>
          </div>
        </mat-expansion-panel-header>

        <ng-template matExpansionPanelContent>
          <material-example [id]="id"></material-example>
        </ng-template>
      </mat-expansion-panel>
    </mat-accordion>
  `,
  styles: [
    `
    mat-expansion-panel {
      box-shadow: none !important;
      border-radius: 0 !important;
      background: transparent;
      border-top: 1px solid #CCC;
    }

    .header {
      display: flex;
      justify-content: space-between;
      width: 100%;
      padding-right: 24px;
      align-items: center;
    }

    .id {
      font-family: monospace;
      color: #666;
      font-size: 12px;
    }
  `,
  ],
})
export class ExampleList {
  /** Type of examples being displayed. */
  @Input() type: string;

  /** IDs of the examples to display. */
  @Input() ids: string[];

  @Input()
  get expandAll(): boolean {
    return this._expandAll;
  }
  set expandAll(v: BooleanInput) {
    this._expandAll = coerceBooleanProperty(v);
  }
  _expandAll: boolean;

  exampleComponents = EXAMPLE_COMPONENTS;

  protected _getTitle(id: string) {
    return this.exampleComponents[id]?.title;
  }
}

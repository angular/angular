/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Input} from '@angular/core';
import {EXAMPLE_COMPONENTS} from '@angular/material-examples';

/** Displays a set of material examples in a mat-accordion. */
@Component({
  selector: 'material-example-list',
  template: `
    <h2> {{type}} Examples </h2>
    <mat-accordion>
      <mat-expansion-panel *ngFor="let id of ids">
        <mat-expansion-panel-header>
          {{id}}: {{exampleComponents[id].title}}
        </mat-expansion-panel-header>
        <ng-template matExpansionPanelContent>
          <material-example [id]="id"></material-example>
        </ng-template>
      </mat-expansion-panel>
    </mat-accordion>
  `,
  styles: [`
    h2 {
      text-transform: capitalize;
    }
  `]
})
export class ExampleList {
  /** Type of examples being displayed. */
  @Input() type: string;

  /** IDs of the examples to display. */
  @Input() ids: string[];

  exampleComponents = EXAMPLE_COMPONENTS;
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Input} from '@angular/core';

/** Loads an example component from `@angular/material-examples`. */
@Component({
  selector: 'example-list-viewer',
  template: `
    <example-viewer *ngFor="let id of ids" [id]="id"></example-viewer>
  `,
})
export class ExampleListViewer {
  /** IDs of the examples to display. */
  @Input() ids: string[];
}

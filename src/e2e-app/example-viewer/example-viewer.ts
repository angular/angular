/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {loadExample} from '@angular/components-examples/private';
import {Component, Injector, Input, OnInit, ViewContainerRef} from '@angular/core';

/** Loads an example component from `@angular/components-examples` */
@Component({
  selector: 'example-viewer',
  template: `
    <div *ngIf="!id">
      Could not find example {{id}}
    </div>
  `,
})
export class ExampleViewer implements OnInit {
  /** ID of the material example to display. */
  @Input() id: string;

  constructor(private _injector: Injector, private _viewContainerRef: ViewContainerRef) {}

  async ngOnInit() {
    const {component, injector} = await loadExample(this.id, this._injector);
    this._viewContainerRef.createComponent(component, {injector});
  }
}

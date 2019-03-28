/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, ElementRef, Injector, Input, OnInit} from '@angular/core';
import {createCustomElement} from '@angular/elements';
import {EXAMPLE_COMPONENTS} from '@angular/material-examples';

/** Loads an example component from `@angular/material-examples` */
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

  constructor(private _elementRef: ElementRef<HTMLElement>, private _injector: Injector) {}

  ngOnInit() {
    let exampleElementCtor = customElements.get(this.id);

    if (!exampleElementCtor) {
      exampleElementCtor =
          createCustomElement(EXAMPLE_COMPONENTS[this.id].component, {injector: this._injector});

      customElements.define(this.id, exampleElementCtor);
    }

    this._elementRef.nativeElement.appendChild(new exampleElementCtor(this._injector));
  }
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {Component, ElementRef, Injector, Input, OnInit} from '@angular/core';
import {EXAMPLE_COMPONENTS} from '@angular/material-examples';
import {createCustomElement} from '@angular/elements';

@Component({
  selector: 'material-example',
  template: `
    <div class="label" *ngIf="showLabel">
      <span class="title"> {{title}} </span>
      <span class="id"> <{{id}}> </span>
    </div>

    <div *ngIf="!id">
      Could not find example {{id}}
    </div>
  `,
  styles: [`
    .label {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin: 16px 0;
    }

    .title {
      font-size: 20px;
      font-weight: 500;
    }

    .id {
      font-size: 13px;
      font-family: monospace;
      color: #666;
      white-space: pre;
    }
  `]
})
export class Example implements OnInit {
  /** ID of the material example to display. */
  @Input() id: string;

  @Input()
  get showLabel(): boolean { return this._showLabel; }
  set showLabel(v: boolean) { this._showLabel = coerceBooleanProperty(v); }
  _showLabel: boolean;

  title: string;

  constructor(private _elementRef: ElementRef<HTMLElement>, private _injector: Injector) { }

  ngOnInit() {
    let exampleElementCtor = customElements.get(this.id);

    if (!exampleElementCtor) {
      exampleElementCtor = createCustomElement(EXAMPLE_COMPONENTS[this.id].component, {
        injector: this._injector
      });

      customElements.define(this.id, exampleElementCtor);
    }

    this._elementRef.nativeElement.appendChild(new exampleElementCtor(this._injector));
    this.title = EXAMPLE_COMPONENTS[this.id] ? EXAMPLE_COMPONENTS[this.id].title : '';
  }
}

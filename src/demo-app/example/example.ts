/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {Component, ElementRef, Input, OnInit} from '@angular/core';
import {EXAMPLE_COMPONENTS} from '@angular/material-examples';

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
  set showLabel(v: boolean) { this._showLabel = coerceBooleanProperty(v); }
  get showLabel(): boolean { return this._showLabel; }
  _showLabel: boolean;

  title: string;

  constructor(private elementRef: ElementRef) { }

  ngOnInit() {
    const element = document.createElement(this.id);
    this.elementRef.nativeElement.appendChild(element);

    this.title = EXAMPLE_COMPONENTS[this.id] ? EXAMPLE_COMPONENTS[this.id].title : '';
  }
}

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
import {loadExample} from '@angular/components-examples/private';
import {
  ChangeDetectorRef,
  Component,
  Injector,
  Input,
  OnInit,
  ViewContainerRef,
} from '@angular/core';

@Component({
  selector: 'material-example',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="label" *ngIf="showLabel">
      <span class="title"> {{title}} </span>
      <span class="id"> <{{id}}> </span>
    </div>

    <div *ngIf="!id">
      Could not find example {{id}}
    </div>
  `,
  styles: [
    `
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
  `,
  ],
})
export class Example implements OnInit {
  /** ID of the material example to display. */
  @Input() id: string;

  @Input()
  get showLabel(): boolean {
    return this._showLabel;
  }
  set showLabel(v: BooleanInput) {
    this._showLabel = coerceBooleanProperty(v);
  }
  _showLabel: boolean;

  title: string;

  constructor(
    private _injector: Injector,
    private _viewContainerRef: ViewContainerRef,
    private _changeDetectorRef: ChangeDetectorRef,
  ) {}

  async ngOnInit() {
    this.title = EXAMPLE_COMPONENTS[this.id].title;

    const example = await loadExample(this.id, this._injector);
    this._viewContainerRef.createComponent(example.component, {injector: example.injector});
    this._changeDetectorRef.detectChanges();
  }
}

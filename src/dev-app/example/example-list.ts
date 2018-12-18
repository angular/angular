/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Input, SimpleChanges, OnChanges, Injector} from '@angular/core';
import {EXAMPLE_COMPONENTS} from '@angular/material-examples';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {createCustomElement} from '@angular/elements';

/** Displays a set of material examples in a mat-accordion. */
@Component({
  selector: 'material-example-list',
  template: `
    <mat-accordion multi>
      <mat-expansion-panel *ngFor="let id of ids" [expanded]="expandAll">
        <mat-expansion-panel-header>
          <div class="header">
            <div class="title"> {{exampleComponents[id]?.title}} </div>
            <div class="id"> <{{id}}> </div>
          </div>
        </mat-expansion-panel-header>

        <ng-template matExpansionPanelContent>
          <material-example [id]="id"></material-example>
        </ng-template>
      </mat-expansion-panel>
    </mat-accordion>
  `,
  styles: [`
    mat-expansion-panel {
      box-shadow: none !important;
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
  `]
})
export class ExampleList implements OnChanges {
  /** Keeps track of the example ids that have been compiled already. */
  private static _compiledComponents = new Set<string>();

  /** Type of examples being displayed. */
  @Input() type: string;

  /** IDs of the examples to display. */
  @Input() ids: string[];

  @Input()
  get expandAll(): boolean { return this._expandAll; }
  set expandAll(v: boolean) { this._expandAll = coerceBooleanProperty(v); }
  _expandAll: boolean;

  exampleComponents = EXAMPLE_COMPONENTS;

  constructor(private _injector: Injector) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.ids) {
      (changes.ids.currentValue as string[])
        .filter(id => !ExampleList._compiledComponents.has(id))
        .forEach(id => {
          const element = createCustomElement(EXAMPLE_COMPONENTS[id].component, {
            injector: this._injector
          });
          customElements.define(id, element);
          ExampleList._compiledComponents.add(id);
        });
    }
  }
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__decorate} from 'tslib';
import {Component, computed, input, output, ChangeDetectionStrategy} from '@angular/core';
import {ButtonComponent} from '../../shared/button/button.component';
import {JsonPipe} from '@angular/common';
let RouteDetailsRowComponent = class RouteDetailsRowComponent {
  constructor() {
    this.label = input.required();
    this.data = input.required();
    this.dataKey = input.required();
    this.renderValueAsJson = input(false);
    this.type = input('text');
    this.btnClick = output();
    this.rowValue = computed(() => {
      return this.data()[this.dataKey()];
    });
    this.dataArray = computed(() => {
      if (!this.data() || !this.dataKey()) {
        return [];
      }
      return this.rowValue();
    });
  }
};
RouteDetailsRowComponent = __decorate(
  [
    Component({
      standalone: true,
      selector: '[ng-route-details-row]',
      templateUrl: './route-details-row.component.html',
      styleUrls: ['./route-details-row.component.scss'],
      imports: [ButtonComponent, JsonPipe],
      changeDetection: ChangeDetectionStrategy.OnPush,
    }),
  ],
  RouteDetailsRowComponent,
);
export {RouteDetailsRowComponent};
//# sourceMappingURL=route-details-row.component.js.map

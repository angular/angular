/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__decorate} from 'tslib';
import {ChangeDetectionStrategy, Component, computed, input, output} from '@angular/core';
import {PropertyTabHeaderComponent} from './property-tab-header/property-tab-header.component';
import {DeferViewComponent} from './defer-view/defer-view.component';
import {PropertyViewComponent} from './property-view/property-view.component';
let PropertyTabComponent = class PropertyTabComponent {
  constructor() {
    this.currentSelectedElement = input.required();
    this.viewSource = output();
    this.inspect = output();
    this.showSignalGraph = output();
    this.currentDirectives = computed(() => {
      const selected = this.currentSelectedElement();
      if (!selected) {
        return;
      }
      const directives = [...selected.directives];
      if (selected.component) {
        directives.push(selected.component);
      }
      return directives;
    });
  }
};
PropertyTabComponent = __decorate(
  [
    Component({
      selector: 'ng-property-tab',
      templateUrl: './property-tab.component.html',
      styleUrls: ['./property-tab.component.scss'],
      imports: [PropertyTabHeaderComponent, PropertyViewComponent, DeferViewComponent],
      changeDetection: ChangeDetectionStrategy.OnPush,
    }),
  ],
  PropertyTabComponent,
);
export {PropertyTabComponent};
//# sourceMappingURL=property-tab.component.js.map

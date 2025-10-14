/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__decorate} from 'tslib';
import {ChangeDetectionStrategy, Component, computed, inject, input, output} from '@angular/core';
import {ElementPropertyResolver} from '../../property-resolver/element-property-resolver';
import {PropertyViewBodyComponent} from './property-view-body/property-view-body.component';
import {PropertyViewHeaderComponent} from './property-view-header/property-view-header.component';
let PropertyViewComponent = class PropertyViewComponent {
  constructor() {
    this.directive = input.required();
    this.inspect = output();
    this.viewSource = output();
    this.showSignalGraph = output();
    this._nestedProps = inject(ElementPropertyResolver);
    this.controller = computed(() =>
      this._nestedProps.getDirectiveController(this.directive().name),
    );
    this.directiveInputControls = computed(() => this.controller()?.directiveInputControls);
    this.directivePropControls = computed(() => this.controller()?.directivePropControls);
    this.directiveOutputControls = computed(() => this.controller()?.directiveOutputControls);
    this.directiveStateControls = computed(() => this.controller()?.directiveStateControls);
  }
};
PropertyViewComponent = __decorate(
  [
    Component({
      selector: 'ng-property-view',
      templateUrl: './property-view.component.html',
      styleUrls: ['./property-view.component.scss'],
      imports: [PropertyViewHeaderComponent, PropertyViewBodyComponent],
      changeDetection: ChangeDetectionStrategy.OnPush,
    }),
  ],
  PropertyViewComponent,
);
export {PropertyViewComponent};
//# sourceMappingURL=property-view.component.js.map

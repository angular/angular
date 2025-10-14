/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__decorate} from 'tslib';
import {ChangeDetectionStrategy, Component, computed, input, output} from '@angular/core';
import {PropType} from '../../../../../../../../../../protocol';
let PropertyPreviewComponent = class PropertyPreviewComponent {
  constructor() {
    this.node = input.required();
    this.inspect = output();
    this.isClickableProp = computed(() => {
      const node = this.node();
      return (
        node.prop.descriptor.type === PropType.Function ||
        node.prop.descriptor.type === PropType.HTMLNode
      );
    });
  }
};
PropertyPreviewComponent = __decorate(
  [
    Component({
      selector: 'ng-property-preview',
      templateUrl: './property-preview.component.html',
      styleUrls: ['./property-preview.component.scss'],
      changeDetection: ChangeDetectionStrategy.OnPush,
    }),
  ],
  PropertyPreviewComponent,
);
export {PropertyPreviewComponent};
//# sourceMappingURL=property-preview.component.js.map

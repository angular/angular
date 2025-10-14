/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__decorate} from 'tslib';
import {ChangeDetectionStrategy, Component, computed, inject, input, output} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {MatTooltip} from '@angular/material/tooltip';
import {MatToolbar} from '@angular/material/toolbar';
import {Platform} from '@angular/cdk/platform';
import {FrameManager} from '../../../../../application-services/frame_manager';
let PropertyViewHeaderComponent = class PropertyViewHeaderComponent {
  constructor() {
    this.directive = input.required();
    this.viewSource = output();
    this.frameManager = inject(FrameManager);
    this.platform = inject(Platform);
    this.disableViewSourceButton = computed(() => {
      const isTopLevelFrame = this.frameManager.topLevelFrameIsActive();
      const frameHasUniqueUrl = this.frameManager.activeFrameHasUniqueUrl();
      return (this.platform.FIREFOX && !isTopLevelFrame) || !frameHasUniqueUrl;
    });
    this.viewSourceTooltip = computed(() =>
      this.disableViewSourceButton()
        ? 'Inspecting source is not supported in Firefox when the inspected frame is not the top-level frame.'
        : 'Open Source',
    );
  }
  // output that emits directive
  handleViewSource(event) {
    event.stopPropagation();
    this.viewSource.emit();
  }
};
PropertyViewHeaderComponent = __decorate(
  [
    Component({
      selector: 'ng-property-view-header',
      templateUrl: './property-view-header.component.html',
      styleUrls: ['./property-view-header.component.scss'],
      imports: [MatToolbar, MatTooltip, MatIcon],
      changeDetection: ChangeDetectionStrategy.OnPush,
    }),
  ],
  PropertyViewHeaderComponent,
);
export {PropertyViewHeaderComponent};
//# sourceMappingURL=property-view-header.component.js.map

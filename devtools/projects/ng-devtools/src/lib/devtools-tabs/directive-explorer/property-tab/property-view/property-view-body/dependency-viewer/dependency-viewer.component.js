/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__decorate} from 'tslib';
import {ChangeDetectionStrategy, Component, input} from '@angular/core';
import {ResolutionPathComponent} from './resolution-path/resolution-path.component';
import {MatTooltip} from '@angular/material/tooltip';
import {MatExpansionModule} from '@angular/material/expansion';
let DependencyViewerComponent = class DependencyViewerComponent {
  constructor() {
    this.dependency = input.required();
  }
};
DependencyViewerComponent = __decorate(
  [
    Component({
      selector: 'ng-dependency-viewer',
      templateUrl: './dependency-viewer.component.html',
      styleUrl: './dependency-viewer.component.scss',
      imports: [MatExpansionModule, MatTooltip, ResolutionPathComponent],
      changeDetection: ChangeDetectionStrategy.OnPush,
    }),
  ],
  DependencyViewerComponent,
);
export {DependencyViewerComponent};
//# sourceMappingURL=dependency-viewer.component.js.map

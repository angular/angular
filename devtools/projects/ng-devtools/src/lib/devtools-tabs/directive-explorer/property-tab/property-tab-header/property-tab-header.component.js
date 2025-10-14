/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__decorate} from 'tslib';
import {ChangeDetectionStrategy, Component, input, output, signal, inject} from '@angular/core';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatIcon} from '@angular/material/icon';
import {ComponentMetadataComponent} from './component-metadata/component-metadata.component';
import {ButtonComponent} from '../../../../shared/button/button.component';
import {Settings} from '../../../../application-services/settings';
let PropertyTabHeaderComponent = class PropertyTabHeaderComponent {
  constructor() {
    this.settings = inject(Settings);
    this.currentSelectedElement = input.required();
    this.showSignalGraph = output();
    this.expanded = signal(false);
    this.signalGraphEnabled = this.settings.signalGraphEnabled;
  }
};
PropertyTabHeaderComponent = __decorate(
  [
    Component({
      templateUrl: './property-tab-header.component.html',
      selector: 'ng-property-tab-header',
      styleUrls: ['./property-tab-header.component.scss'],
      changeDetection: ChangeDetectionStrategy.OnPush,
      imports: [MatExpansionModule, MatIcon, ComponentMetadataComponent, ButtonComponent],
    }),
  ],
  PropertyTabHeaderComponent,
);
export {PropertyTabHeaderComponent};
//# sourceMappingURL=property-tab-header.component.js.map

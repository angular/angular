/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__decorate} from 'tslib';
import {
  ChangeDetectionStrategy,
  Component,
  ɵFramework as Framework,
  computed,
  inject,
  input,
} from '@angular/core';
import {ElementPropertyResolver} from '../../../property-resolver/element-property-resolver';
import {DocsRefButtonComponent} from '../../../../../shared/docs-ref-button/docs-ref-button.component';
let ComponentMetadataComponent = class ComponentMetadataComponent {
  constructor() {
    this.currentSelectedComponent = input.required();
    this._nestedProps = inject(ElementPropertyResolver);
    this.angularViewEncapsulationModes = [
      'Emulated',
      'Native',
      'None',
      'ShadowDom',
      'IsolatedShadowDom',
    ];
    this.acxViewEncapsulationModes = ['Emulated', 'None'];
    this.controller = computed(() => {
      const comp = this.currentSelectedComponent();
      if (!comp) {
        return;
      }
      return this._nestedProps.getDirectiveController(comp.name);
    });
    this.viewEncapsulation = computed(() => {
      const metadata = this.controller()?.directiveMetadata;
      if (!metadata) return undefined;
      const encapsulation = metadata.encapsulation;
      if (!encapsulation) return undefined;
      switch (metadata.framework) {
        case Framework.Angular:
          return this.angularViewEncapsulationModes[encapsulation];
        case Framework.ACX:
          return this.acxViewEncapsulationModes[encapsulation];
        default:
          return undefined;
      }
    });
    this.changeDetectionStrategy = computed(() => {
      const metadata = this.controller()?.directiveMetadata;
      if (!metadata) return undefined;
      const meta = metadata;
      if (meta.onPush !== undefined) {
        return meta.onPush ? 'OnPush' : 'Default';
      } else {
        return undefined;
      }
    });
  }
};
ComponentMetadataComponent = __decorate(
  [
    Component({
      selector: 'ng-component-metadata',
      templateUrl: './component-metadata.component.html',
      styleUrls: ['./component-metadata.component.scss'],
      imports: [DocsRefButtonComponent],
      changeDetection: ChangeDetectionStrategy.OnPush,
    }),
  ],
  ComponentMetadataComponent,
);
export {ComponentMetadataComponent};
//# sourceMappingURL=component-metadata.component.js.map

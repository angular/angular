/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ChangeDetectionStrategy,
  Component,
  ɵFramework as Framework,
  computed,
  inject,
  input,
} from '@angular/core';
import {MatIcon} from '@angular/material/icon';

import {
  AngularDirectiveMetadata,
  AcxDirectiveMetadata,
  ComponentType,
} from '../../../../../../protocol';

import {ElementPropertyResolver} from '../property-resolver/element-property-resolver';
import {MatTooltip} from '@angular/material/tooltip';

@Component({
  selector: 'ng-component-metadata',
  templateUrl: './component-metadata.component.html',
  styleUrls: ['./component-metadata.component.scss'],
  imports: [MatIcon, MatTooltip],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComponentMetadataComponent {
  readonly currentSelectedComponent = input.required<ComponentType>();

  private _nestedProps = inject(ElementPropertyResolver);

  angularViewEncapsulationModes = ['Emulated', 'Native', 'None', 'ShadowDom'];
  acxViewEncapsulationModes = ['Emulated', 'None'];

  readonly controller = computed(() => {
    const comp = this.currentSelectedComponent();
    if (!comp) {
      return;
    }
    return this._nestedProps.getDirectiveController(comp.name);
  });

  readonly viewEncapsulation = computed(() => {
    const metadata = this.controller()?.directiveMetadata;
    if (!metadata) return undefined;

    const encapsulation = (metadata as AngularDirectiveMetadata | AcxDirectiveMetadata)
      .encapsulation;
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

  readonly changeDetectionStrategy = computed(() => {
    const metadata = this.controller()?.directiveMetadata;
    if (!metadata) return undefined;

    const meta = metadata as Partial<AcxDirectiveMetadata | AngularDirectiveMetadata>;
    if (meta.onPush !== undefined) {
      return meta.onPush ? 'OnPush' : 'Default';
    } else {
      return undefined;
    }
  });
}

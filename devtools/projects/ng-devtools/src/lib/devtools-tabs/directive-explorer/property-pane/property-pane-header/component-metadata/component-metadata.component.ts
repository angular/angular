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

import {
  AcxDirectiveMetadata,
  AngularDirectiveMetadata,
  ComponentType,
} from '../../../../../../../../protocol';

import {DocsRefButtonComponent} from '../../../../../shared/docs-ref-button/docs-ref-button.component';
import {ElementPropertyResolver} from '../../../property-resolver/element-property-resolver';

@Component({
  selector: 'ng-component-metadata',
  templateUrl: './component-metadata.component.html',
  styleUrls: ['./component-metadata.component.scss'],
  imports: [DocsRefButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComponentMetadataComponent {
  readonly currentSelectedComponent = input.required<ComponentType>();

  private _nestedProps = inject(ElementPropertyResolver);

  angularViewEncapsulationModes = [
    'Emulated',
    'Native',
    'None',
    'ShadowDom',
    'ExperimentalIsolatedShadowDom',
  ];
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
      return meta.onPush ? 'OnPush' : 'Eager';
    } else {
      return undefined;
    }
  });
}

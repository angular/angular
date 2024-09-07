/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, computed, inject, input} from '@angular/core';
import {ComponentType} from 'protocol';

import {ElementPropertyResolver} from '../property-resolver/element-property-resolver';
import {MatButton} from '@angular/material/button';

@Component({
  selector: 'ng-component-metadata',
  templateUrl: './component-metadata.component.html',
  styleUrls: ['./component-metadata.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButton],
})
export class ComponentMetadataComponent {
  readonly currentSelectedComponent = input.required<ComponentType>();

  private _nestedProps = inject(ElementPropertyResolver);

  viewEncapsulationModes = ['Emulated', 'Native', 'None', 'ShadowDom'];

  readonly controller = computed(() => {
    const comp = this.currentSelectedComponent();
    if (!comp) {
      return;
    }
    return this._nestedProps.getDirectiveController(comp.name);
  });

  readonly viewEncapsulation = computed(() => {
    const encapsulationIndex = this.controller()?.directiveViewEncapsulation;
    if (encapsulationIndex !== undefined) {
      return this.viewEncapsulationModes[encapsulationIndex];
    }
    return undefined;
  });

  readonly changeDetectionStrategy = computed(() => {
    const onPush = this.controller()?.directiveHasOnPushStrategy;
    return onPush ? 'OnPush' : onPush !== undefined ? 'Default' : undefined;
  });
}

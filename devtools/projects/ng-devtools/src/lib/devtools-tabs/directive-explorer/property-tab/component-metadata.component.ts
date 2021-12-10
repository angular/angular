/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {ComponentType} from 'protocol';

import {DirectivePropertyResolver} from '../property-resolver/directive-property-resolver';
import {ElementPropertyResolver} from '../property-resolver/element-property-resolver';

@Component({
  selector: 'ng-component-metadata',
  templateUrl: './component-metadata.component.html',
  styleUrls: ['./component-metadata.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComponentMetadataComponent {
  @Input() currentSelectedComponent: ComponentType;

  constructor(private _nestedProps: ElementPropertyResolver) {}

  viewEncapsulationModes = ['Emulated', 'Native', 'None', 'ShadowDom'];

  get controller(): DirectivePropertyResolver|undefined {
    if (!this.currentSelectedComponent) {
      return;
    }
    return this._nestedProps.getDirectiveController(this.currentSelectedComponent.name);
  }

  get viewEncapsulation(): string|undefined {
    const encapsulationIndex = this?.controller?.directiveViewEncapsulation;
    if (encapsulationIndex !== undefined) {
      return this.viewEncapsulationModes[encapsulationIndex];
    }
  }

  get changeDetectionStrategy(): string|undefined {
    const onPush = this?.controller?.directiveHasOnPushStrategy;
    return onPush ? 'OnPush' : onPush !== undefined ? 'Default' : undefined;
  }
}

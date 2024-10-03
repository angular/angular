/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, computed, inject, input, output} from '@angular/core';
import {DirectivePosition} from 'protocol';

import {ElementPropertyResolver, FlatNode} from '../../property-resolver/element-property-resolver';
import {PropertyViewBodyComponent} from './property-view-body.component';
import {PropertyViewHeaderComponent} from './property-view-header.component';

@Component({
  selector: 'ng-property-view',
  templateUrl: './property-view.component.html',
  styleUrls: ['./property-view.component.scss'],
  imports: [PropertyViewHeaderComponent, PropertyViewBodyComponent],
})
export class PropertyViewComponent {
  readonly directive = input.required<string>();
  readonly inspect = output<{node: FlatNode; directivePosition: DirectivePosition}>();
  readonly viewSource = output<void>();

  private _nestedProps = inject(ElementPropertyResolver);

  readonly controller = computed(() => this._nestedProps.getDirectiveController(this.directive()));

  readonly directiveInputControls = computed(() => this.controller()?.directiveInputControls);

  readonly directiveOutputControls = computed(() => this.controller()?.directiveOutputControls);

  readonly directiveStateControls = computed(() => this.controller()?.directiveStateControls);
}

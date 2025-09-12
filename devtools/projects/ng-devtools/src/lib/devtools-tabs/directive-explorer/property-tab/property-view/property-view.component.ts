/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, computed, inject, input, output} from '@angular/core';
import {DebugSignalGraphNode, DirectivePosition} from '../../../../../../../protocol';

import {ElementPropertyResolver, FlatNode} from '../../property-resolver/element-property-resolver';
import {PropertyViewBodyComponent} from './property-view-body/property-view-body.component';
import {PropertyViewHeaderComponent} from './property-view-header/property-view-header.component';

@Component({
  selector: 'ng-property-view',
  templateUrl: './property-view.component.html',
  styleUrls: ['./property-view.component.scss'],
  imports: [PropertyViewHeaderComponent, PropertyViewBodyComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PropertyViewComponent {
  readonly directive = input.required<{name: string}>();

  readonly inspect = output<{node: FlatNode; directivePosition: DirectivePosition}>();
  readonly viewSource = output<void>();
  readonly showSignalGraph = output<DebugSignalGraphNode>();

  private _nestedProps = inject(ElementPropertyResolver);

  protected readonly controller = computed(() =>
    this._nestedProps.getDirectiveController(this.directive().name),
  );

  protected readonly directiveInputControls = computed(
    () => this.controller()?.directiveInputControls,
  );
  protected readonly directivePropControls = computed(
    () => this.controller()?.directivePropControls,
  );
  protected readonly directiveOutputControls = computed(
    () => this.controller()?.directiveOutputControls,
  );
  protected readonly directiveStateControls = computed(
    () => this.controller()?.directiveStateControls,
  );
}

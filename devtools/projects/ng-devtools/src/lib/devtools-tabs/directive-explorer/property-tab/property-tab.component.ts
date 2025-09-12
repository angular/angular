/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, computed, input, output} from '@angular/core';
import {DebugSignalGraphNode, DirectivePosition} from '../../../../../../protocol';

import {IndexedNode} from '../directive-forest/index-forest';
import {FlatNode} from '../property-resolver/element-property-resolver';
import {PropertyTabHeaderComponent} from './property-tab-header/property-tab-header.component';
import {DeferViewComponent} from './defer-view/defer-view.component';
import {PropertyViewComponent} from './property-view/property-view.component';

@Component({
  selector: 'ng-property-tab',
  templateUrl: './property-tab.component.html',
  styleUrls: ['./property-tab.component.scss'],
  imports: [PropertyTabHeaderComponent, PropertyViewComponent, DeferViewComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PropertyTabComponent {
  readonly currentSelectedElement = input.required<IndexedNode | null>();

  readonly viewSource = output<string>();
  readonly inspect = output<{node: FlatNode; directivePosition: DirectivePosition}>();
  readonly showSignalGraph = output<DebugSignalGraphNode | null>();

  readonly currentDirectives = computed(() => {
    const selected = this.currentSelectedElement();
    if (!selected) {
      return;
    }
    const directives = [...selected.directives];
    if (selected.component) {
      directives.push(selected.component);
    }
    return directives;
  });
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, computed, input, output} from '@angular/core';
import {DirectivePosition} from '../../../../../../protocol';

import {IndexedNode} from '../directive-forest/index-forest';
import {PropertyPaneHeaderComponent} from './property-pane-header/property-pane-header.component';
import {DeferViewComponent} from './defer-view/defer-view.component';
import {PropertyViewComponent} from './property-view/property-view.component';
import {FlatNode} from '../../../shared/object-tree-explorer/object-tree-types';
import {DevtoolsSignalGraphNode} from '../signal-graph';

@Component({
  selector: 'ng-property-pane',
  templateUrl: './property-pane.component.html',
  styleUrls: ['./property-pane.component.scss'],
  imports: [PropertyPaneHeaderComponent, PropertyViewComponent, DeferViewComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PropertyPaneComponent {
  readonly currentSelectedElement = input.required<IndexedNode | null>();

  readonly viewSource = output<string>();
  readonly inspect = output<{node: FlatNode; directivePosition: DirectivePosition}>();
  readonly showSignalGraph = output<DevtoolsSignalGraphNode | null>();

  readonly currentDirectives = computed(() => {
    const selected = this.currentSelectedElement();
    if (!selected) {
      return;
    }
    const directives = [];
    if (selected.component) {
      directives.push(selected.component);
    }
    directives.push(...selected.directives);

    return directives;
  });
}

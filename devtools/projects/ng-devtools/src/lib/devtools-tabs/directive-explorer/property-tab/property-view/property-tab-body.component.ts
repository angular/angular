/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, computed, input, output} from '@angular/core';
import {DirectivePosition} from 'protocol';

import {IndexedNode} from '../../directive-forest/index-forest';
import {FlatNode} from '../../property-resolver/element-property-resolver';
import {PropertyViewComponent} from './property-view.component';

@Component({
  selector: 'ng-property-tab-body',
  templateUrl: './property-tab-body.component.html',
  styleUrls: ['./property-tab-body.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PropertyViewComponent],
})
export class PropertyTabBodyComponent {
  readonly currentSelectedElement = input.required<IndexedNode>();
  readonly inspect = output<{node: FlatNode; directivePosition: DirectivePosition}>();
  readonly viewSource = output<string>();

  readonly currentDirectives = computed(() => {
    const selected = this.currentSelectedElement();
    if (!selected) {
      return;
    }
    const directives = selected.directives.map((d) => d.name);
    if (selected.component) {
      directives.push(selected.component.name);
    }
    return directives;
  });
}

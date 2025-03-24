/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, input, output} from '@angular/core';
import {DirectivePosition} from 'protocol';

import {IndexedNode} from '../directive-forest/index-forest';
import {FlatNode} from '../property-resolver/element-property-resolver';
import {PropertyTabBodyComponent} from './property-view/property-tab-body.component';
import {PropertyTabHeaderComponent} from './property-tab-header.component';

@Component({
  templateUrl: './property-tab.component.html',
  selector: 'ng-property-tab',
  imports: [PropertyTabHeaderComponent, PropertyTabBodyComponent],
})
export class PropertyTabComponent {
  readonly currentSelectedElement = input.required<IndexedNode>();
  readonly viewSource = output<string>();
  readonly inspect = output<{node: FlatNode; directivePosition: DirectivePosition}>();
}

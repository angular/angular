/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, EventEmitter, Input, Output} from '@angular/core';
import {DirectivePosition} from 'protocol';

import {IndexedNode} from '../directive-forest/index-forest/index.js';
import {FlatNode} from '../property-resolver/element-property-resolver.js';

@Component({
  templateUrl: './property-tab.component.html',
  selector: 'ng-property-tab',
})
export class PropertyTabComponent {
  @Input() currentSelectedElement: IndexedNode;
  @Output() viewSource = new EventEmitter<void>();
  @Output() inspect = new EventEmitter<{node: FlatNode; directivePosition: DirectivePosition}>();
}

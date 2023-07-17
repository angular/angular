/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, EventEmitter, Input, Output} from '@angular/core';
import {DirectivePosition} from 'protocol';

import {IndexedNode} from '../../directive-forest/index-forest';
import {FlatNode} from '../../property-resolver/element-property-resolver';

@Component({
  templateUrl: './property-tab-body.component.html',
  selector: 'ng-property-tab-body',
  styleUrls: ['./property-tab-body.component.scss'],
})
export class PropertyTabBodyComponent {
  @Input() currentSelectedElement: IndexedNode|null;
  @Output() inspect = new EventEmitter<{node: FlatNode; directivePosition: DirectivePosition}>();
  @Output() viewSource = new EventEmitter<string>();

  getCurrentDirectives(): string[]|undefined {
    if (!this.currentSelectedElement) {
      return;
    }
    const directives = this.currentSelectedElement.directives.map((d) => d.name);
    if (this.currentSelectedElement.component) {
      directives.push(this.currentSelectedElement.component.name);
    }
    return directives;
  }
}

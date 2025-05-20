/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, computed, input, output} from '@angular/core';
import {PropType} from '../../../../../../../protocol';

import {FlatNode} from '../../property-resolver/element-property-resolver';

@Component({
  selector: 'ng-property-preview',
  templateUrl: './property-preview.component.html',
  styleUrls: ['./property-preview.component.scss'],
})
export class PropertyPreviewComponent {
  readonly node = input.required<FlatNode>();
  readonly inspect = output<void>();

  readonly isClickableProp = computed(() => {
    const node = this.node();
    return (
      node.prop.descriptor.type === PropType.Function ||
      node.prop.descriptor.type === PropType.HTMLNode
    );
  });
}

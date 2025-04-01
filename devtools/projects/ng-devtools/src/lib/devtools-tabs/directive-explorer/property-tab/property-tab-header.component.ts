/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, input} from '@angular/core';

import {IndexedNode} from '../directive-forest/index-forest';
import {ComponentMetadataComponent} from './component-metadata.component';
import {MatExpansionModule} from '@angular/material/expansion';

@Component({
  templateUrl: './property-tab-header.component.html',
  selector: 'ng-property-tab-header',
  styleUrls: ['./property-tab-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatExpansionModule, ComponentMetadataComponent],
})
export class PropertyTabHeaderComponent {
  currentSelectedElement = input.required<IndexedNode>();
}

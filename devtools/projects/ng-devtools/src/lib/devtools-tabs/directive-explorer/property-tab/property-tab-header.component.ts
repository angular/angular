/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, input, output} from '@angular/core';
import {MatExpansionModule} from '@angular/material/expansion';

import {IndexedNode} from '../directive-forest/index-forest';
import {ComponentMetadataComponent} from './component-metadata.component';
import {ButtonComponent} from '../../../shared/button/button.component';

@Component({
  templateUrl: './property-tab-header.component.html',
  selector: 'ng-property-tab-header',
  styleUrls: ['./property-tab-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatExpansionModule, ComponentMetadataComponent, ButtonComponent],
})
export class PropertyTabHeaderComponent {
  readonly currentSelectedElement = input.required<IndexedNode>();
  readonly signalGraphEnabled = input.required<boolean>();
  readonly showSignalGraph = output<void>();

  showGraph(event: Event) {
    event.stopPropagation();
    this.showSignalGraph.emit();
  }
}

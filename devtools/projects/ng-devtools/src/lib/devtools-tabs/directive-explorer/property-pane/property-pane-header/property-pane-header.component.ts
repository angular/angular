/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, input, output, signal, inject} from '@angular/core';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatIcon} from '@angular/material/icon';

import {IndexedNode} from '../../directive-forest/index-forest';
import {ComponentMetadataComponent} from './component-metadata/component-metadata.component';
import {ButtonComponent} from '../../../../shared/button/button.component';
import {SUPPORTED_APIS} from '../../../../application-providers/supported_apis';

@Component({
  templateUrl: './property-pane-header.component.html',
  selector: 'ng-property-pane-header',
  styleUrls: ['./property-pane-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatExpansionModule, MatIcon, ComponentMetadataComponent, ButtonComponent],
})
export class PropertyPaneHeaderComponent {
  private readonly supportedApis = inject(SUPPORTED_APIS);

  protected readonly currentSelectedElement = input.required<IndexedNode>();
  protected readonly showSignalGraph = output<void>();

  protected readonly expanded = signal(false);

  protected readonly signalGraphEnabled = () => this.supportedApis().signals;
}

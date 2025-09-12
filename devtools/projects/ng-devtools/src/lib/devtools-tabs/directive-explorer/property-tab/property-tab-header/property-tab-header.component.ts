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
import {Settings} from '../../../../application-services/settings';

@Component({
  templateUrl: './property-tab-header.component.html',
  selector: 'ng-property-tab-header',
  styleUrls: ['./property-tab-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatExpansionModule, MatIcon, ComponentMetadataComponent, ButtonComponent],
})
export class PropertyTabHeaderComponent {
  private readonly settings = inject(Settings);

  protected readonly currentSelectedElement = input.required<IndexedNode>();
  protected readonly showSignalGraph = output<void>();

  protected readonly expanded = signal(false);

  protected readonly signalGraphEnabled = this.settings.signalGraphEnabled;
}

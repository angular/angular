/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, input, output} from '@angular/core';
import {DataSource} from '@angular/cdk/collections';
import {FlatTreeControl} from '@angular/cdk/tree';
import {MatIcon} from '@angular/material/icon';

import {DebugSignalGraphNode} from '../../../../../../../protocol';

import {
  FlatNode,
  SignalsValueTreeComponent,
} from './signals-value-tree/signals-value-tree.component';
import {ButtonComponent} from '../../../../shared/button/button.component';

const TYPE_CLASS_MAP: {[key: string]: string} = {
  'signal': 'type-signal',
  'computed': 'type-computed',
  'effect': 'type-effect',
  'template': 'type-template',
};

@Component({
  selector: 'ng-signals-details',
  templateUrl: './signals-details.component.html',
  styleUrl: './signals-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SignalsValueTreeComponent, MatIcon, ButtonComponent],
})
export class SignalsDetailsComponent {
  protected readonly node = input.required<DebugSignalGraphNode>();
  protected readonly dataSource = input.required<DataSource<FlatNode>>();
  protected readonly treeControl = input.required<FlatTreeControl<FlatNode>>();

  protected readonly gotoSource = output<DebugSignalGraphNode>();
  protected readonly close = output<void>();

  protected readonly TYPE_CLASS_MAP = TYPE_CLASS_MAP;
}

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, ViewEncapsulation, Input, ChangeDetectionStrategy} from '@angular/core';
import {mixinDisabled, CanDisable} from '../common-behaviors/disabled';

// Boilerplate for applying mixins to MdOptgroup.
/** @docs-private */
export class MdOptgroupBase { }
export const _MdOptgroupMixinBase = mixinDisabled(MdOptgroupBase);

// Counter for unique group ids.
let _uniqueOptgroupIdCounter = 0;

/**
 * Component that is used to group instances of `md-option`.
 */
@Component({
  moduleId: module.id,
  selector: 'md-optgroup, mat-optgroup',
  templateUrl: 'optgroup.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  inputs: ['disabled'],
  host: {
    'class': 'mat-optgroup',
    'role': 'group',
    '[class.mat-optgroup-disabled]': 'disabled',
    '[attr.aria-disabled]': 'disabled.toString()',
    '[attr.aria-labelledby]': '_labelId',
  }
})
export class MdOptgroup extends _MdOptgroupMixinBase implements CanDisable {
  /** Label for the option group. */
  @Input() label: string;

  /** Unique id for the underlying label. */
  _labelId: string = `mat-optgroup-label-${_uniqueOptgroupIdCounter++}`;
}

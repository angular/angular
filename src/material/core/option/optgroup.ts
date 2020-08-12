/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BooleanInput} from '@angular/cdk/coercion';
import {
  ChangeDetectionStrategy,
  Component,
  InjectionToken,
  Input,
  ViewEncapsulation,
  Directive
} from '@angular/core';
import {CanDisable, CanDisableCtor, mixinDisabled} from '../common-behaviors/disabled';


// Boilerplate for applying mixins to MatOptgroup.
/** @docs-private */
class MatOptgroupBase { }
const _MatOptgroupMixinBase: CanDisableCtor & typeof MatOptgroupBase =
    mixinDisabled(MatOptgroupBase);

// Counter for unique group ids.
let _uniqueOptgroupIdCounter = 0;

@Directive()
export class _MatOptgroupBase extends _MatOptgroupMixinBase implements CanDisable {
  /** Label for the option group. */
  @Input() label: string;

  /** Unique id for the underlying label. */
  _labelId: string = `mat-optgroup-label-${_uniqueOptgroupIdCounter++}`;

  static ngAcceptInputType_disabled: BooleanInput;
}

/**
 * Injection token that can be used to reference instances of `MatOptgroup`. It serves as
 * alternative token to the actual `MatOptgroup` class which could cause unnecessary
 * retention of the class and its component metadata.
 */
export const MAT_OPTGROUP = new InjectionToken<MatOptgroup>('MatOptgroup');

/**
 * Component that is used to group instances of `mat-option`.
 */
@Component({
  selector: 'mat-optgroup',
  exportAs: 'matOptgroup',
  templateUrl: 'optgroup.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  inputs: ['disabled'],
  styleUrls: ['optgroup.css'],
  host: {
    'class': 'mat-optgroup',
    'role': 'group',
    '[class.mat-optgroup-disabled]': 'disabled',
    '[attr.aria-disabled]': 'disabled.toString()',
    '[attr.aria-labelledby]': '_labelId',
  },
  providers: [{provide: MAT_OPTGROUP, useExisting: MatOptgroup}],
})
export class MatOptgroup extends _MatOptgroupBase {
}

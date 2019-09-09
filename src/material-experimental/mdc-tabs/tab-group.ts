/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  ElementRef,
  QueryList,
  ViewChild,
  ViewEncapsulation,
  ChangeDetectorRef,
  Inject,
  Optional,
} from '@angular/core';
import {_MatTabGroupBase, MAT_TABS_CONFIG, MatTabsConfig} from '@angular/material/tabs';
import {ANIMATION_MODULE_TYPE} from '@angular/platform-browser/animations';
import {MatTab} from './tab';
import {MatTabHeader} from './tab-header';

/**
 * Material design tab-group component. Supports basic tab pairs (label + content) and includes
 * animated ink-bar, keyboard navigation, and screen reader.
 * See: https://material.io/design/components/tabs.html
 */
@Component({
  moduleId: module.id,
  selector: 'mat-tab-group',
  exportAs: 'matTabGroup',
  templateUrl: 'tab-group.html',
  styleUrls: ['tab-group.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  inputs: ['color', 'disableRipple'],
  host: {
    'class': 'mat-mdc-tab-group',
    '[class.mat-mdc-tab-group-dynamic-height]': 'dynamicHeight',
    '[class.mat-mdc-tab-group-inverted-header]': 'headerPosition === "below"',
  },
})
export class MatTabGroup extends _MatTabGroupBase {
  @ContentChildren(MatTab) _tabs: QueryList<MatTab>;
  @ViewChild('tabBodyWrapper', {static: false}) _tabBodyWrapper: ElementRef;
  @ViewChild('tabHeader', {static: false}) _tabHeader: MatTabHeader;

  constructor(elementRef: ElementRef,
              changeDetectorRef: ChangeDetectorRef,
              @Inject(MAT_TABS_CONFIG) @Optional() defaultConfig?: MatTabsConfig,
              @Optional() @Inject(ANIMATION_MODULE_TYPE) animationMode?: string) {
    super(elementRef, changeDetectorRef, defaultConfig, animationMode);
  }
}

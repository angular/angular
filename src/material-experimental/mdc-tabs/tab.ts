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
  ViewEncapsulation,
  TemplateRef,
  ContentChild,
} from '@angular/core';
import {MatTab as BaseMatTab} from '@angular/material/tabs';
import {MatTabContent} from './tab-content';
import {MatTabLabel} from './tab-label';

@Component({
  moduleId: module.id,
  selector: 'mat-tab',

  // Note that usually we'd go through a bit more trouble and set up another class so that
  // the inlined template of `MatTab` isn't duplicated, however the template is small enough
  // that creating the extra class will generate more code than just duplicating the template.
  templateUrl: 'tab.html',
  inputs: ['disabled'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  exportAs: 'matTab',
})
export class MatTab extends BaseMatTab {
  /**
   * Template provided in the tab content that will be used if present, used to enable lazy-loading
   */
  @ContentChild(MatTabContent, {read: TemplateRef, static: true})
  _explicitContent: TemplateRef<any>;

  /** Content for the tab label given by `<ng-template mat-tab-label>`. */
  @ContentChild(MatTabLabel, {static: false}) templateLabel: MatTabLabel;
}

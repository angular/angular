/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Platform} from '@angular/cdk/platform';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Inject,
  NgZone,
  Optional,
  ViewEncapsulation
} from '@angular/core';
import {ANIMATION_MODULE_TYPE} from '@angular/platform-browser/animations';

import {MatAnchor} from './button';
import {
  MAT_ANCHOR_HOST,
  MAT_ANCHOR_INPUTS,
  MAT_BUTTON_HOST,
  MAT_BUTTON_INPUTS,
  MatButtonBase
} from './button-base';


@Component({
  moduleId: module.id,
  selector: `button[mat-fab], button[mat-mini-fab]`,
  templateUrl: 'button.html',
  styleUrls: ['fab.css'],
  inputs: MAT_BUTTON_INPUTS,
  host: MAT_BUTTON_HOST,
  exportAs: 'matButton',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatFabButton extends MatButtonBase {
  constructor(
      elementRef: ElementRef, platform: Platform, ngZone: NgZone,
      @Optional() @Inject(ANIMATION_MODULE_TYPE) animationMode?: string) {
    super(elementRef, platform, ngZone, animationMode);
  }
}

@Component({
  moduleId: module.id,
  selector: `a[mat-fab], a[mat-mini-fab]`,
  templateUrl: 'button.html',
  styleUrls: ['fab.css'],
  inputs: MAT_ANCHOR_INPUTS,
  host: MAT_ANCHOR_HOST,
  exportAs: 'matButton, matAnchor',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatFabAnchor extends MatAnchor {
  constructor(
      elementRef: ElementRef, platform: Platform, ngZone: NgZone,
      @Optional() @Inject(ANIMATION_MODULE_TYPE) animationMode?: string) {
    super(elementRef, platform, ngZone, animationMode);
  }
}

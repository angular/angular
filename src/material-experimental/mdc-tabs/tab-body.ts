/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  Component,
  Directive,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  ViewChild,
  ComponentFactoryResolver,
  ViewContainerRef,
  Inject,
  forwardRef,
  ChangeDetectorRef,
  Optional,
  ElementRef,
} from '@angular/core';
import {
  MatTabBodyPortal as BaseMatTabBodyPortal,
  matTabsAnimations,
  _MatTabBodyBase,
} from '@angular/material/tabs';
import {PortalHostDirective} from '@angular/cdk/portal';
import {Directionality} from '@angular/cdk/bidi';

/**
 * The portal host directive for the contents of the tab.
 * @docs-private
 */
@Directive({
  selector: '[matTabBodyHost]'
})
export class MatTabBodyPortal extends BaseMatTabBodyPortal {
  constructor(
    componentFactoryResolver: ComponentFactoryResolver,
    viewContainerRef: ViewContainerRef,
    @Inject(forwardRef(() => MatTabBody)) host: MatTabBody) {
    super(componentFactoryResolver, viewContainerRef, host);
  }
}

/**
 * Wrapper for the contents of a tab.
 * @docs-private
 */
@Component({
  moduleId: module.id,
  selector: 'mat-tab-body',
  templateUrl: 'tab-body.html',
  styleUrls: ['tab-body.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [matTabsAnimations.translateTab],
  host: {
    'class': 'mat-mdc-tab-body',
  },
})
export class MatTabBody extends _MatTabBodyBase {
  @ViewChild(PortalHostDirective, {static: false}) _portalHost: PortalHostDirective;

  constructor(elementRef: ElementRef<HTMLElement>,
    @Optional() dir: Directionality,
    changeDetectorRef: ChangeDetectorRef) {
    super(elementRef, dir, changeDetectorRef);
  }
}

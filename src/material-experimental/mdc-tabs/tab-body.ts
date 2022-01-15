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
import {CdkPortalOutlet} from '@angular/cdk/portal';
import {Directionality} from '@angular/cdk/bidi';
import {DOCUMENT} from '@angular/common';

/**
 * The portal host directive for the contents of the tab.
 * @docs-private
 */
@Directive({
  selector: '[matTabBodyHost]',
})
export class MatTabBodyPortal extends BaseMatTabBodyPortal {
  constructor(
    componentFactoryResolver: ComponentFactoryResolver,
    viewContainerRef: ViewContainerRef,
    @Inject(forwardRef(() => MatTabBody)) host: MatTabBody,
    @Inject(DOCUMENT) _document: any,
  ) {
    super(componentFactoryResolver, viewContainerRef, host, _document);
  }
}

/**
 * Wrapper for the contents of a tab.
 * @docs-private
 */
@Component({
  selector: 'mat-tab-body',
  templateUrl: 'tab-body.html',
  styleUrls: ['tab-body.css'],
  encapsulation: ViewEncapsulation.None,
  // tslint:disable-next-line:validate-decorators
  changeDetection: ChangeDetectionStrategy.Default,
  animations: [matTabsAnimations.translateTab],
  host: {
    'class': 'mat-mdc-tab-body',
  },
})
export class MatTabBody extends _MatTabBodyBase {
  @ViewChild(CdkPortalOutlet) _portalHost: CdkPortalOutlet;

  constructor(
    elementRef: ElementRef<HTMLElement>,
    @Optional() dir: Directionality,
    changeDetectorRef: ChangeDetectorRef,
  ) {
    super(elementRef, dir, changeDetectorRef);
  }
}

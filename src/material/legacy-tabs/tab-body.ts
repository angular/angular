/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ComponentFactoryResolver,
  Directive,
  ElementRef,
  forwardRef,
  Inject,
  Optional,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation,
} from '@angular/core';
import {CdkPortalOutlet} from '@angular/cdk/portal';
import {Directionality} from '@angular/cdk/bidi';
import {DOCUMENT} from '@angular/common';
import {
  _MatTabBodyBase,
  MatTabBodyPortal as MatNonLegacyTabBodyPortal,
  matTabsAnimations,
} from '@angular/material/tabs';

/**
 * The portal host directive for the contents of the tab.
 * @docs-private
 */
@Directive({
  selector: '[matTabBodyHost]',
})
export class MatLegacyTabBodyPortal extends MatNonLegacyTabBodyPortal {
  constructor(
    componentFactoryResolver: ComponentFactoryResolver,
    viewContainerRef: ViewContainerRef,
    @Inject(forwardRef(() => MatLegacyTabBody)) host: MatLegacyTabBody,
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
    'class': 'mat-tab-body',
  },
})
export class MatLegacyTabBody extends _MatTabBodyBase {
  @ViewChild(CdkPortalOutlet) _portalHost: CdkPortalOutlet;

  constructor(
    elementRef: ElementRef<HTMLElement>,
    @Optional() dir: Directionality,
    changeDetectorRef: ChangeDetectorRef,
  ) {
    super(elementRef, dir, changeDetectorRef);
  }
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directionality} from '@angular/cdk/bidi';
import {
  CdkOverlayOrigin,
  HorizontalConnectionPos,
  Overlay,
  OverlayModule,
  OverlayRef,
  VerticalConnectionPos,
} from '@angular/cdk/overlay';
import {TemplatePortal} from '@angular/cdk/portal';
import {CommonModule} from '@angular/common';
import {CdkOverlayExamplesModule} from '@angular/components-examples/cdk/overlay';
import {
  Component,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation,
} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatLegacyCheckboxModule} from '@angular/material/legacy-checkbox';
import {MatRadioModule} from '@angular/material/radio';

@Component({
  selector: 'overlay-demo',
  templateUrl: 'connected-overlay-demo.html',
  styleUrls: ['connected-overlay-demo.css'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    CdkOverlayExamplesModule,
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatLegacyCheckboxModule,
    MatRadioModule,
    OverlayModule,
  ],
})
export class ConnectedOverlayDemo {
  @ViewChild(CdkOverlayOrigin) _overlayOrigin: CdkOverlayOrigin;
  @ViewChild('overlay') overlayTemplate: TemplateRef<any>;

  originX: HorizontalConnectionPos = 'start';
  originY: VerticalConnectionPos = 'bottom';
  overlayX: HorizontalConnectionPos = 'start';
  overlayY: VerticalConnectionPos = 'top';
  isFlexible = true;
  canPush = true;
  isBoundingBoxVisible = false;
  offsetX = 0;
  offsetY = 0;
  itemCount = 25;
  itemArray: any[] = [];
  itemText = 'Item with a long name';
  overlayRef: OverlayRef | null;

  constructor(
    public overlay: Overlay,
    public viewContainerRef: ViewContainerRef,
    public dir: Directionality,
  ) {}

  openWithConfig() {
    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(this._overlayOrigin.elementRef)
      .withFlexibleDimensions(this.isFlexible)
      .withPush(this.canPush)
      .withViewportMargin(10)
      .withGrowAfterOpen(true)
      .withPositions([
        {
          originX: this.originX,
          originY: this.originY,
          overlayX: this.overlayX,
          overlayY: this.overlayY,
          offsetX: this.offsetX,
          offsetY: this.offsetY,
        },
        {
          originX: 'start',
          originY: 'top',
          overlayX: 'start',
          overlayY: 'bottom',
        },
        {
          originX: 'start',
          originY: 'bottom',
          overlayX: 'start',
          overlayY: 'top',
        },
      ]);

    this.overlayRef = this.overlay.create({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      direction: this.dir.value,
      minWidth: 200,
      minHeight: 50,
    });

    this.itemArray = Array(this.itemCount);
    this.overlayRef.attach(new TemplatePortal(this.overlayTemplate, this.viewContainerRef));
  }

  close() {
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = null;
      this.isBoundingBoxVisible = false;
    }
  }

  showBoundingBox(showBoundingBox: boolean) {
    const box = document.querySelector<HTMLElement>('.cdk-overlay-connected-position-bounding-box');

    if (box) {
      box.classList.toggle('demo-bounding-box-visible', showBoundingBox);
    }
  }
}

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
  OverlayRef,
  VerticalConnectionPos
} from '@angular/cdk/overlay';
import {TemplatePortal} from '@angular/cdk/portal';
import {Component, TemplateRef, ViewChild, ViewContainerRef} from '@angular/core';


@Component({
  moduleId: module.id,
  selector: 'overlay-demo',
  templateUrl: 'connected-overlay-demo.html',
  styleUrls: ['connected-overlay-demo.css'],
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
  showBoundingBox = false;
  offsetX = 0;
  offsetY = 0;
  itemCount = 25;
  itemArray: any[] = [];
  itemText = 'Item with a long name';
  overlayRef: OverlayRef | null;

  constructor(
      public overlay: Overlay,
      public viewContainerRef: ViewContainerRef,
      public dir: Directionality) { }

  openWithConfig() {
    const positionStrategy = this.overlay.position()
        .flexibleConnectedTo(this._overlayOrigin.elementRef)
        .withFlexibleDimensions(this.isFlexible)
        .withPush(this.canPush)
        .withViewportMargin(10)
        .withGrowAfterOpen(true)
        .withPositions([{
          originX: this.originX,
          originY: this.originY,
          overlayX: this.overlayX,
          overlayY: this.overlayY,
          offsetX: this.offsetX,
          offsetY: this.offsetY
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
        }
      ]);

    this.overlayRef = this.overlay.create({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      direction: this.dir.value,
      minWidth: 200,
      minHeight: 50
    });

    this.itemArray = Array(this.itemCount);
    this.overlayRef.attach(new TemplatePortal(this.overlayTemplate, this.viewContainerRef));
  }

  close() {
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = null;
      this.showBoundingBox = false;
    }
  }

  toggleShowBoundingBox() {
    const box = document.querySelector<HTMLElement>('.cdk-overlay-connected-position-bounding-box');

    if (box) {
      this.showBoundingBox = !this.showBoundingBox;
      box.style.background = this.showBoundingBox ? 'rgb(255, 69, 0, 0.2)' : '';
    }
  }
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, ViewChild, ViewContainerRef, ViewEncapsulation} from '@angular/core';
import {ComponentPortal} from '@angular/cdk/portal';
import {Directionality} from '@angular/cdk/bidi';
import {
  HorizontalConnectionPos,
  Overlay,
  OverlayOrigin,
  OverlayRef,
  VerticalConnectionPos
} from '@angular/cdk/overlay';


let itemCount = 25;

@Component({
  moduleId: module.id,
  selector: 'overlay-demo',
  templateUrl: 'connected-overlay-demo.html',
  styleUrls: ['connected-overlay-demo.css'],
  encapsulation: ViewEncapsulation.None,
})
export class ConnectedOverlayDemo {
  @ViewChild(OverlayOrigin) _overlayOrigin: OverlayOrigin;

  originX: HorizontalConnectionPos = 'start';
  originY: VerticalConnectionPos = 'bottom';
  overlayX: HorizontalConnectionPos = 'start';
  overlayY: VerticalConnectionPos = 'top';
  isFlexible = true;
  canPush = true;
  showBoundingBox = false;
  offsetX = 0;
  offsetY = 0;
  overlayRef: OverlayRef | null;

  constructor(
      public overlay: Overlay,
      public viewContainerRef: ViewContainerRef,
      public dir: Directionality) { }

  openWithConfig() {
    const positionStrategy = this.overlay.position()
        .flexibleConnectedTo(this._overlayOrigin.elementRef)
        .withFlexibleHeight(this.isFlexible)
        .withFlexibleWidth(this.isFlexible)
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

    this.overlayRef.attach(new ComponentPortal(DemoOverlay, this.viewContainerRef));
  }

  close() {
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = null;
      this.showBoundingBox = false;
    }
  }

  updateCount(value: number) {
    itemCount = +value;
  }

  toggleShowBoundingBox() {
    const box = document.querySelector('.cdk-overlay-connected-position-bounding-box');

    if (box) {
      this.showBoundingBox = !this.showBoundingBox;
      box.classList.toggle('demo-show-box');
    }
  }
}


@Component({
  template: `
    <div style="overflow: auto;">
      {{items.length}}
      <ul><li *ngFor="let item of items; index as i">Item with a long name {{i}}</li></ul>
    </div>`,
  encapsulation: ViewEncapsulation.None,
})
export class DemoOverlay {
  items = Array(itemCount);
}


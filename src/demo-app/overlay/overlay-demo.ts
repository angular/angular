/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CdkOverlayOrigin, Overlay, OverlayConfig} from '@angular/cdk/overlay';
import {CdkPortal, ComponentPortal, Portal} from '@angular/cdk/portal';
import {
  Component,
  QueryList,
  ViewChild,
  ViewChildren,
  ViewContainerRef
} from '@angular/core';
import {filter, tap} from 'rxjs/operators';


@Component({
  moduleId: module.id,
  selector: 'overlay-demo',
  templateUrl: 'overlay-demo.html',
  styleUrls: ['overlay-demo.css'],
})
export class OverlayDemo {
  nextPosition: number = 0;
  isMenuOpen: boolean = false;
  tortelliniFillings = ['cheese and spinach', 'mushroom and broccoli'];

  @ViewChildren(CdkPortal) templatePortals: QueryList<Portal<any>>;
  @ViewChild(CdkOverlayOrigin) _overlayOrigin: CdkOverlayOrigin;
  @ViewChild('tortelliniOrigin') tortelliniOrigin: CdkOverlayOrigin;
  @ViewChild('tortelliniTemplate') tortelliniTemplate: CdkPortal;

  constructor(public overlay: Overlay, public viewContainerRef: ViewContainerRef) { }

  openRotiniPanel() {
    const config = new OverlayConfig();

    config.positionStrategy = this.overlay.position()
        .global()
        .left(`${this.nextPosition}px`)
        .top(`${this.nextPosition}px`);

    this.nextPosition += 30;

    const overlayRef = this.overlay.create(config);
    overlayRef.attach(new ComponentPortal(RotiniPanel, this.viewContainerRef));
  }

  openFusilliPanel() {
    const config = new OverlayConfig();

    config.positionStrategy = this.overlay.position()
        .global()
        .centerHorizontally()
        .top(`${this.nextPosition}px`);

    this.nextPosition += 30;

    const overlayRef = this.overlay.create(config);
    overlayRef.attach(this.templatePortals.first);
  }

  openSpaghettiPanel() {
    // TODO(jelbourn): separate overlay demo for connected positioning.
    const strategy = this.overlay.position()
        .connectedTo(
            this._overlayOrigin.elementRef,
            {originX: 'start', originY: 'bottom'},
            {overlayX: 'start', overlayY: 'top'} );

    const config = new OverlayConfig({positionStrategy: strategy});
    const overlayRef = this.overlay.create(config);

    overlayRef.attach(new ComponentPortal(SpaghettiPanel, this.viewContainerRef));
  }

  openTortelliniPanel() {
    const strategy = this.overlay.position()
        .connectedTo(
            this.tortelliniOrigin.elementRef,
            {originX: 'start', originY: 'bottom'},
            {overlayX: 'end', overlayY: 'top'} );

    const config = new OverlayConfig({positionStrategy: strategy});
    const overlayRef = this.overlay.create(config);

    overlayRef.attach(this.tortelliniTemplate);
  }

  openPanelWithBackdrop() {
    const config = new OverlayConfig({
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
      positionStrategy: this.overlay.position().global().centerHorizontally()
    });

    const overlayRef = this.overlay.create(config);
    overlayRef.attach(this.templatePortals.first);
    overlayRef.backdropClick().subscribe(() => overlayRef.detach());
  }

  openKeyboardTracking() {
    const config = new OverlayConfig();

    config.positionStrategy = this.overlay.position()
      .global()
      .centerHorizontally()
      .top(`${this.nextPosition}px`);

    this.nextPosition += 30;

    const overlayRef = this.overlay.create(config);
    const componentRef = overlayRef
        .attach(new ComponentPortal(KeyboardTrackingPanel, this.viewContainerRef));

    overlayRef.keydownEvents()
      .pipe(
        tap(e => componentRef.instance.lastKeydown = e.key),
        filter(e => e.key === 'Escape')
      ).subscribe(() => overlayRef.detach());
  }
}

/** Simple component to load into an overlay */
@Component({
  moduleId: module.id,
  selector: 'rotini-panel',
  template: '<p class="demo-rotini">Rotini {{value}}</p>',
})
export class RotiniPanel {
  value: number = 9000;
}

/** Simple component to load into an overlay */
@Component({
  selector: 'spaghetti-panel',
  template: '<div class="demo-spaghetti">Spagetti {{value}}</div>',
})
export class SpaghettiPanel {
  value: string = 'Omega';
}

/** Simple component to load into an overlay */
@Component({
  selector: 'keyboard-panel',
  template: '<div class="demo-keyboard">Last Keydown: {{ lastKeydown }}</div>',
})
export class KeyboardTrackingPanel {
  lastKeydown = '';
}

import {
    Component,
    ViewChildren,
    QueryList,
    ViewEncapsulation,
    ViewChild,
    ViewContainerRef,
} from '@angular/core';
import {
    Overlay,
    OverlayState,
    OverlayOrigin,
    ComponentPortal,
    // This import is only used to define a generic type. The current TypeScript version incorrectly
    // considers such imports as unused (https://github.com/Microsoft/TypeScript/issues/14953)
    // tslint:disable-next-line:no-unused-variable
    Portal,
    TemplatePortalDirective,
} from '@angular/material';


@Component({
  moduleId: module.id,
  selector: 'overlay-demo',
  templateUrl: 'overlay-demo.html',
  styleUrls: ['overlay-demo.css'],
  encapsulation: ViewEncapsulation.None,
})
export class OverlayDemo {
  nextPosition: number = 0;
  isMenuOpen: boolean = false;
  tortelliniFillings = ['cheese and spinach', 'mushroom and broccoli'];

  @ViewChildren(TemplatePortalDirective) templatePortals: QueryList<Portal<any>>;
  @ViewChild(OverlayOrigin) _overlayOrigin: OverlayOrigin;
  @ViewChild('tortelliniOrigin') tortelliniOrigin: OverlayOrigin;
  @ViewChild('tortelliniTemplate') tortelliniTemplate: TemplatePortalDirective;

  constructor(public overlay: Overlay, public viewContainerRef: ViewContainerRef) { }

  openRotiniPanel() {
    let config = new OverlayState();

    config.positionStrategy = this.overlay.position()
        .global()
        .left(`${this.nextPosition}px`)
        .top(`${this.nextPosition}px`);

    this.nextPosition += 30;

    let overlayRef = this.overlay.create(config);
    overlayRef.attach(new ComponentPortal(RotiniPanel, this.viewContainerRef));
  }

  openFusilliPanel() {
    let config = new OverlayState();

    config.positionStrategy = this.overlay.position()
        .global()
        .centerHorizontally()
        .top(`${this.nextPosition}px`);

    this.nextPosition += 30;

    let overlayRef = this.overlay.create(config);
    overlayRef.attach(this.templatePortals.first);
  }

  openSpaghettiPanel() {
    // TODO(jelbourn): separate overlay demo for connected positioning.
    let strategy = this.overlay.position()
        .connectedTo(
            this._overlayOrigin.elementRef,
            {originX: 'start', originY: 'bottom'},
            {overlayX: 'start', overlayY: 'top'} );

    let config = new OverlayState({positionStrategy: strategy});
    let overlayRef = this.overlay.create(config);

    overlayRef.attach(new ComponentPortal(SpagettiPanel, this.viewContainerRef));
  }

  openTortelliniPanel() {
    let strategy = this.overlay.position()
        .connectedTo(
            this.tortelliniOrigin.elementRef,
            {originX: 'start', originY: 'bottom'},
            {overlayX: 'end', overlayY: 'top'} );

    let config = new OverlayState({positionStrategy: strategy});
    let overlayRef = this.overlay.create(config);

    overlayRef.attach(this.tortelliniTemplate);
  }

  openPanelWithBackdrop() {
    let config = new OverlayState({
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
      positionStrategy: this.overlay.position().global().centerHorizontally()
    });

    let overlayRef = this.overlay.create(config);
    overlayRef.attach(this.templatePortals.first);
    overlayRef.backdropClick().subscribe(() => overlayRef.detach());
  }

}

/** Simple component to load into an overlay */
@Component({
  moduleId: module.id,
  selector: 'rotini-panel',
  template: '<p class="demo-rotini">Rotini {{value}}</p>'
})
export class RotiniPanel {
  value: number = 9000;
}

/** Simple component to load into an overlay */
@Component({
  selector: 'spagetti-panel',
  template: '<div class="demo-spagetti">Spagetti {{value}}</div>'
})
export class SpagettiPanel {
  value: string = 'Omega';
}

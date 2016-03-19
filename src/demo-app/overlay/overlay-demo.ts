import {Component, provide, ElementRef, ViewChildren, QueryList} from 'angular2/core';
import {Overlay, OVERLAY_CONTAINER_TOKEN} from '../../core/overlay/overlay';
import {ComponentPortal, Portal} from '../../core/portal/portal';
import {BrowserDomAdapter} from '../../core/platform/browser/browser_adapter';
import {TemplatePortalDirective} from '../../core/portal/portal-directives';


@Component({
  selector: 'overlay-demo',
  templateUrl: 'demo-app/overlay/overlay-demo.html',
  styleUrls: ['demo-app/overlay/overlay-demo.css'],
  directives: [TemplatePortalDirective],
  providers: [
    Overlay,
    provide(OVERLAY_CONTAINER_TOKEN, {useValue: document.body})
  ]
})
export class OverlayDemo {
  @ViewChildren(TemplatePortalDirective) templatePortals: QueryList<Portal<any>>;

  constructor(public overlay: Overlay, public elementRef: ElementRef) {
    BrowserDomAdapter.makeCurrent();
  }

  openRotiniPanel() {
    this.overlay.create().then(ref => {
      ref.attach(new ComponentPortal(PastaPanel, this.elementRef));
    });
  }

  openFusilliPanel() {
    this.overlay.create().then(ref => {
      ref.attach(this.templatePortals.first);
    });
  }
}

/** Simple component to load into an overlay */
@Component({
  selector: 'pasta-panel',
  template: '<p>Rotini {{value}}</p>'
})
class PastaPanel {
  value: number = 9000;
}

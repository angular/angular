import {Component, ElementRef, ViewChildren, QueryList} from 'angular2/core';
import {Overlay} from '../../core/overlay/overlay';
import {ComponentPortal, Portal} from '../../core/portal/portal';
import {TemplatePortalDirective} from '../../core/portal/portal-directives';


@Component({
  selector: 'overlay-demo',
  templateUrl: 'demo-app/overlay/overlay-demo.html',
  styleUrls: ['demo-app/overlay/overlay-demo.css'],
  directives: [TemplatePortalDirective],
  providers: [
    Overlay,
  ]
})
export class OverlayDemo {
  @ViewChildren(TemplatePortalDirective) templatePortals: QueryList<Portal<any>>;

  constructor(public overlay: Overlay, public elementRef: ElementRef) { }

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

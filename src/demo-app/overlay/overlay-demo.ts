import {
    Component, ViewChildren, QueryList, ViewEncapsulation,
    ViewContainerRef
} from '@angular/core';
import {
  Overlay,
  OverlayState} from '../../core/overlay/overlay';
import {ComponentPortal, Portal} from '../../core/portal/portal';
import {TemplatePortalDirective} from '../../core/portal/portal-directives';


@Component({
  selector: 'overlay-demo',
  templateUrl: 'demo-app/overlay/overlay-demo.html',
  styleUrls: ['demo-app/overlay/overlay-demo.css'],
  directives: [TemplatePortalDirective],
  providers: [Overlay],
  encapsulation: ViewEncapsulation.None,
})
export class OverlayDemo {
  nextPosition: number = 0;

  @ViewChildren(TemplatePortalDirective) templatePortals: QueryList<Portal<any>>;

  constructor(public overlay: Overlay, public viewContainerRef: ViewContainerRef) { }

  openRotiniPanel() {
    let config = new OverlayState();

    config.positionStrategy = this.overlay.position()
        .global()
        .left(`${this.nextPosition}px`)
        .top(`${this.nextPosition}px`);

    this.nextPosition += 30;

    this.overlay.create(config).then(ref => {
      ref.attach(new ComponentPortal(PastaPanel, this.viewContainerRef));
    });
  }

  openFusilliPanel() {
    let config = new OverlayState();

    config.positionStrategy = this.overlay.position()
        .global()
        .centerHorizontally()
        .top(`${this.nextPosition}px`);

    this.nextPosition += 30;

    this.overlay.create(config).then(ref => {
      ref.attach(this.templatePortals.first);
    });
  }
}

/** Simple component to load into an overlay */
@Component({
  selector: 'pasta-panel',
  template: '<p class="demo-rotini">Rotini {{value}}</p>'
})
class PastaPanel {
  value: number = 9000;
}

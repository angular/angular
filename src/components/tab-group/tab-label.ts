import {Directive, TemplateRef, ViewContainerRef} from '@angular/core';
import {TemplatePortalDirective} from '@angular2-material/core/portal/portal-directives';

/** Used to flag tab labels for use with the portal directive */
@Directive({
  selector: '[md-tab-label]',
})
export class MdTabLabel extends TemplatePortalDirective {
  constructor(templateRef: TemplateRef<any>, viewContainerRef: ViewContainerRef) {
    super(templateRef, viewContainerRef);
  }
}

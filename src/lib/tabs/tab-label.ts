import {Directive, TemplateRef, ViewContainerRef} from '@angular/core';
import {TemplatePortalDirective} from '../core';

/** Used to flag tab labels for use with the portal directive */
@Directive({
  selector: '[md-tab-label], [mat-tab-label], [mdTabLabel], [matTabLabel]',
})
export class MdTabLabel extends TemplatePortalDirective {
  constructor(templateRef: TemplateRef<any>, viewContainerRef: ViewContainerRef) {
    super(templateRef, viewContainerRef);
  }
}

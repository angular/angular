import {Component, ComponentRef, ViewChild, ViewEncapsulation} from '@angular/core';
import {
  BasePortalHost,
  ComponentPortal,
  PortalHostDirective,
  TemplatePortal
} from '@angular2-material/core';
import {MdDialogConfig} from './dialog-config';
import {MdDialogContentAlreadyAttachedError} from './dialog-errors';


/**
 * Internal component that wraps user-provided dialog content.
 */
@Component({
  moduleId: module.id,
  selector: 'md-dialog-container',
  templateUrl: 'dialog-container.html',
  styleUrls: ['dialog-container.css'],
  host: {
    'class': 'md-dialog-container',
    '[attr.role]': 'dialogConfig?.role'
  },
  encapsulation: ViewEncapsulation.None,
})
export class MdDialogContainer extends BasePortalHost {
  /** The portal host inside of this container into which the dialog content will be loaded. */
  @ViewChild(PortalHostDirective) _portalHost: PortalHostDirective;

  /** The dialog configuration. */
  dialogConfig: MdDialogConfig;

  /** Attach a portal as content to this dialog container. */
  attachComponentPortal<T>(portal: ComponentPortal<T>): ComponentRef<T> {
    if (this._portalHost.hasAttached()) {
      throw new MdDialogContentAlreadyAttachedError();
    }

    return this._portalHost.attachComponentPortal(portal);
  }

  attachTemplatePortal(portal: TemplatePortal): Map<string, any> {
    throw Error('Not yet implemented');
  }
}

import {
  Component,
  ComponentRef,
  ViewChild
} from '@angular/core';
import {
  BasePortalHost,
  ComponentPortal,
  TemplatePortal,
  PortalHostDirective
} from '../core';
import {MdSnackBarConfig} from './snack-bar-config';
import {MdSnackBarContentAlreadyAttached} from './snack-bar-errors';


/**
 * Internal component that wraps user-provided snack bar content.
 */
@Component({
  moduleId: module.id,
  selector: 'snack-bar-container',
  templateUrl: 'snack-bar-container.html',
  styleUrls: ['snack-bar-container.css'],
  host: {
    'role': 'alert'
  }
})
export class MdSnackBarContainer extends BasePortalHost {
  /** The portal host inside of this container into which the snack bar content will be loaded. */
  @ViewChild(PortalHostDirective) _portalHost: PortalHostDirective;

  /** The snack bar configuration. */
  snackBarConfig: MdSnackBarConfig;

  /** Attach a portal as content to this snack bar container. */
  attachComponentPortal<T>(portal: ComponentPortal<T>): ComponentRef<T> {
    if (this._portalHost.hasAttached()) {
      throw new MdSnackBarContentAlreadyAttached();
    }

    return this._portalHost.attachComponentPortal(portal);
  }

  attachTemplatePortal(portal: TemplatePortal): Map<string, any> {
    throw Error('Not yet implemented');
  }
}

import {Component, ComponentRef, ViewChild, AfterViewInit} from '@angular/core';
import {
  BasePortalHost,
  ComponentPortal,
  TemplatePortal
} from '@angular2-material/core/portal/portal';
import {PortalHostDirective} from '@angular2-material/core/portal/portal-directives';
import {PromiseCompleter} from '@angular2-material/core/async/promise-completer';
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
  directives: [PortalHostDirective],
  host: {
    'class': 'md-dialog-container',
    '[attr.role]': 'dialogConfig?.role'
  }
})
export class MdDialogContainer extends BasePortalHost implements AfterViewInit {
  /** The portal host inside of this container into which the dialog content will be loaded. */
  @ViewChild(PortalHostDirective) private _portalHost: PortalHostDirective;

  /**
   * Completer used to resolve the promise for cases when a portal is attempted to be attached,
   * but AfterViewInit has not yet occured.
   */
  private _deferredAttachCompleter: PromiseCompleter<ComponentRef<any>>;

  /** Portal to be attached upon AfterViewInit. */
  private _deferredAttachPortal: ComponentPortal<any>;

  /** The dialog configuration. */
  dialogConfig: MdDialogConfig;

  /** TODO: internal */
  ngAfterViewInit() {
    // If there was an attempted call to `attachComponentPortal` before this lifecycle stage,
    // we actually perform the attachment now that the `@ViewChild` is resolved.
    if (this._deferredAttachCompleter) {
      this.attachComponentPortal(this._deferredAttachPortal).then(componentRef => {
        this._deferredAttachCompleter.resolve(componentRef);

        this._deferredAttachPortal = null;
        this._deferredAttachCompleter = null;
      }, () => {
        this._deferredAttachCompleter.reject();
        this._deferredAttachCompleter = null;
        this._deferredAttachPortal = null;
      });
    }
  }

  /** Attach a portal as content to this dialog container. */
  attachComponentPortal<T>(portal: ComponentPortal<T>): Promise<ComponentRef<T>> {
    if (this._portalHost) {
      if (this._portalHost.hasAttached()) {
        throw new MdDialogContentAlreadyAttachedError();
      }

      return this._portalHost.attachComponentPortal(portal);
    } else {
      // The @ViewChild query for the portalHost is not resolved until AfterViewInit, but this
      // function may be called before this lifecycle event. As such, we defer the attachment of
      // the portal until AfterViewInit.
      if (this._deferredAttachCompleter) {
        throw new MdDialogContentAlreadyAttachedError();
      }

      this._deferredAttachPortal = portal;
      this._deferredAttachCompleter = new PromiseCompleter();
      return this._deferredAttachCompleter.promise;
    }
  }

  attachTemplatePortal(portal: TemplatePortal): Promise<Map<string, any>> {
    throw Error('Not yet implemented');
  }
}

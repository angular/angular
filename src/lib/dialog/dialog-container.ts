import {
  Component,
  ComponentRef,
  ViewChild,
  ViewEncapsulation,
  NgZone,
  OnDestroy,
} from '@angular/core';
import {BasePortalHost, ComponentPortal, PortalHostDirective, TemplatePortal} from '../core';
import {MdDialogConfig} from './dialog-config';
import {MdDialogRef} from './dialog-ref';
import {MdDialogContentAlreadyAttachedError} from './dialog-errors';
import {FocusTrap} from '../core/a11y/focus-trap';
import 'rxjs/add/operator/first';


/**
 * Internal component that wraps user-provided dialog content.
 */
@Component({
  moduleId: module.id,
  selector: 'md-dialog-container, mat-dialog-container',
  templateUrl: 'dialog-container.html',
  styleUrls: ['dialog-container.css'],
  host: {
    'class': 'md-dialog-container',
    '[attr.role]': 'dialogConfig?.role',
    '(keydown.escape)': 'handleEscapeKey()',
  },
  encapsulation: ViewEncapsulation.None,
})
export class MdDialogContainer extends BasePortalHost implements OnDestroy {
  /** The portal host inside of this container into which the dialog content will be loaded. */
  @ViewChild(PortalHostDirective) _portalHost: PortalHostDirective;

  /** The directive that traps and manages focus within the dialog. */
  @ViewChild(FocusTrap) _focusTrap: FocusTrap;

  /** Element that was focused before the dialog was opened. Save this to restore upon close. */
  private _elementFocusedBeforeDialogWasOpened: Element = null;

  /** The dialog configuration. */
  dialogConfig: MdDialogConfig;

  /** Reference to the open dialog. */
  dialogRef: MdDialogRef<any>;

  constructor(private _ngZone: NgZone) {
    super();
  }

  /** Attach a portal as content to this dialog container. */
  attachComponentPortal<T>(portal: ComponentPortal<T>): ComponentRef<T> {
    if (this._portalHost.hasAttached()) {
      throw new MdDialogContentAlreadyAttachedError();
    }

    let attachResult = this._portalHost.attachComponentPortal(portal);

    // If were to attempt to focus immediately, then the content of the dialog would not yet be
    // ready in instances where change detection has to run first. To deal with this, we simply
    // wait for the microtask queue to be empty.
    this._ngZone.onMicrotaskEmpty.first().subscribe(() => {
      this._elementFocusedBeforeDialogWasOpened = document.activeElement;
      this._focusTrap.focusFirstTabbableElement();
    });

    return attachResult;
  }

  attachTemplatePortal(portal: TemplatePortal): Map<string, any> {
    throw Error('Not yet implemented');
  }

  /** Handles the user pressing the Escape key. */
  handleEscapeKey() {
    if (!this.dialogConfig.disableClose) {
      this.dialogRef.close();
    }
  }

  ngOnDestroy() {
    // When the dialog is destroyed, return focus to the element that originally had it before
    // the dialog was opened. Wait for the DOM to finish settling before changing the focus so
    // that it doesn't end up back on the <body>.
    this._ngZone.onMicrotaskEmpty.first().subscribe(() => {
      (this._elementFocusedBeforeDialogWasOpened as HTMLElement).focus();
    });
  }
}

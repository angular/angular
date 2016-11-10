import {
  NgModule,
  ModuleWithProviders,
  Injectable,
  ComponentRef,
} from '@angular/core';
import {
  ComponentType,
  ComponentPortal,
  Overlay,
  OverlayModule,
  OverlayRef,
  OverlayState,
  PortalModule,
  OVERLAY_PROVIDERS,
  MdLiveAnnouncer,
} from '../core';
import {CommonModule} from '@angular/common';
import {MdSnackBarConfig} from './snack-bar-config';
import {MdSnackBarRef} from './snack-bar-ref';
import {MdSnackBarContainer} from './snack-bar-container';
import {SimpleSnackBar} from './simple-snack-bar';
import {extendObject} from '../core/util/object-extend';

// TODO(josephperrott): Automate dismiss after timeout.


/**
 * Service to dispatch Material Design snack bar messages.
 */
@Injectable()
export class MdSnackBar {
  /** A reference to the current snack bar in the view. */
  private _snackBarRef: MdSnackBarRef<any>;

  constructor(private _overlay: Overlay, private _live: MdLiveAnnouncer) {}

  /**
   * Creates and dispatches a snack bar with a custom component for the content, removing any
   * currently opened snack bars.
   */
  openFromComponent<T>(component: ComponentType<T>, config?: MdSnackBarConfig): MdSnackBarRef<T> {
    config = _applyConfigDefaults(config);
    let overlayRef = this._createOverlay();
    let snackBarContainer = this._attachSnackBarContainer(overlayRef, config);
    let snackBarRef = this._attachSnackbarContent(component, snackBarContainer, overlayRef);

    // When the snackbar is dismissed, clear the reference to it.
    snackBarRef.afterDismissed().subscribe(() => {
      // Clear the snackbar ref if it hasn't already been replaced by a newer snackbar.
      if (this._snackBarRef == snackBarRef) {
        this._snackBarRef = null;
      }
    });

    // If a snack bar is already in view, dismiss it and enter the new snack bar after exit
    // animation is complete.
    if (this._snackBarRef) {
      this._snackBarRef.afterDismissed().subscribe(() => {
        snackBarRef.containerInstance.enter();
      });
      this._snackBarRef.dismiss();
    // If no snack bar is in view, enter the new snack bar.
    } else {
      snackBarRef.containerInstance.enter();
    }
    this._live.announce(config.announcementMessage, config.politeness);
    this._snackBarRef = snackBarRef;
    return this._snackBarRef;
  }

  /**
   * Opens a snackbar with a message and an optional action.
   * @param message The message to show in the snackbar.
   * @param action The label for the snackbar action.
   * @param config Additional configuration options for the snackbar.
   * @returns {MdSnackBarRef<SimpleSnackBar>}
   */
  open(message: string, action = '', config: MdSnackBarConfig = {}): MdSnackBarRef<SimpleSnackBar> {
    config.announcementMessage = message;
    let simpleSnackBarRef = this.openFromComponent(SimpleSnackBar, config);
    simpleSnackBarRef.instance.snackBarRef = simpleSnackBarRef;
    simpleSnackBarRef.instance.message = message;
    simpleSnackBarRef.instance.action = action;
    return simpleSnackBarRef;
  }

  /**
   * Attaches the snack bar container component to the overlay.
   */
  private _attachSnackBarContainer(overlayRef: OverlayRef,
                                   config: MdSnackBarConfig): MdSnackBarContainer {
    let containerPortal = new ComponentPortal(MdSnackBarContainer, config.viewContainerRef);
    let containerRef: ComponentRef<MdSnackBarContainer> = overlayRef.attach(containerPortal);
    containerRef.instance.snackBarConfig = config;

    return containerRef.instance;
  }

  /**
   * Places a new component as the content of the snack bar container.
   */
  private _attachSnackbarContent<T>(component: ComponentType<T>,
                                    container: MdSnackBarContainer,
                                    overlayRef: OverlayRef): MdSnackBarRef<T> {
    let portal = new ComponentPortal(component);
    let contentRef = container.attachComponentPortal(portal);
    return new MdSnackBarRef(contentRef.instance, container, overlayRef);
  }

  /**
   * Creates a new overlay and places it in the correct location.
   */
  private _createOverlay(): OverlayRef {
    let state = new OverlayState();
    state.positionStrategy = this._overlay.position().global()
        .fixed()
        .centerHorizontally()
        .bottom('0');
    return this._overlay.create(state);
  }
}

/**
 * Applies default options to the snackbar config.
 * @param config The configuration to which the defaults will be applied.
 * @returns The new configuration object with defaults applied.
 */
function _applyConfigDefaults(config: MdSnackBarConfig): MdSnackBarConfig {
  return extendObject(new MdSnackBarConfig(), config);
}


@NgModule({
  imports: [OverlayModule, PortalModule, CommonModule],
  exports: [MdSnackBarContainer],
  declarations: [MdSnackBarContainer, SimpleSnackBar],
  entryComponents: [MdSnackBarContainer, SimpleSnackBar],
})
export class MdSnackBarModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MdSnackBarModule,
      providers: [MdSnackBar, OVERLAY_PROVIDERS, MdLiveAnnouncer]
    };
  }
}

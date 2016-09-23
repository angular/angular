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

export {MdSnackBarRef} from './snack-bar-ref';
export {MdSnackBarConfig} from './snack-bar-config';

// TODO(josephperrott): Animate entrance and exit of snack bars.
// TODO(josephperrott): Automate dismiss after timeout.


/**
 * Service to dispatch Material Design snack bar messages.
 */
@Injectable()
export class MdSnackBar {
  /** A reference to the current snack bar in the view. */
  private _snackBarRef: MdSnackBarRef<any>;

  constructor(private _overlay: Overlay,
              private _live: MdLiveAnnouncer) {}

  /**
   * Creates and dispatches a snack bar with a custom component for the content, removing any
   * currently opened snack bars.
   */
  openFromComponent<T>(component: ComponentType<T>,
                       config: MdSnackBarConfig): MdSnackBarRef<T> {
    if (this._snackBarRef) {
      this._snackBarRef.dismiss();
    }
    let overlayRef = this._createOverlay();
    let snackBarContainer = this._attachSnackBarContainer(overlayRef, config);
    let mdSnackBarRef = this._attachSnackbarContent(component, snackBarContainer, overlayRef);
    this._live.announce(config.announcementMessage, config.politeness);
    return mdSnackBarRef;
  }

  /**
   * Creates and dispatches a snack bar.
   */
  open(message: string, actionLabel: string,
       config: MdSnackBarConfig): MdSnackBarRef<SimpleSnackBar> {
    config.announcementMessage = message;
    let simpleSnackBarRef = this.openFromComponent(SimpleSnackBar, config);
    simpleSnackBarRef.instance.snackBarRef = simpleSnackBarRef;
    simpleSnackBarRef.instance.message = message;
    simpleSnackBarRef.instance.action = actionLabel;
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
    let snackBarRef = <MdSnackBarRef<T>> new MdSnackBarRef(contentRef.instance, overlayRef);

    this._snackBarRef = snackBarRef;
    return snackBarRef;
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

import {Injector, ComponentRef, Injectable} from '@angular/core';
import {Overlay} from '@angular2-material/core/overlay/overlay';
import {OverlayRef} from '@angular2-material/core/overlay/overlay-ref';
import {OverlayState} from '@angular2-material/core/overlay/overlay-state';
import {ComponentPortal} from '@angular2-material/core/portal/portal';
import {ComponentType} from '@angular2-material/core/overlay/generic-component-type';
import {MdDialogConfig} from './dialog-config';
import {MdDialogRef} from './dialog-ref';
import {DialogInjector} from './dialog-injector';
import {MdDialogContainer} from './dialog-container';


export {MdDialogConfig} from './dialog-config';
export {MdDialogRef} from './dialog-ref';


// TODO(jelbourn): add shortcuts for `alert` and `confirm`.
// TODO(jelbourn): add support for opening with a TemplateRef
// TODO(jelbourn): add `closeAll` method
// TODO(jelbourn): add backdrop
// TODO(jelbourn): default dialog config
// TODO(jelbourn): focus trapping
// TODO(jelbourn): potentially change API from accepting component constructor to component factory.



/**
 * Service to open Material Design modal dialogs.
 */
@Injectable()
export class MdDialog {
  constructor(private _overlay: Overlay, private _injector: Injector) { }

  /**
   * Opens a modal dialog containing the given component.
   * @param component Type of the component to load into the load.
   * @param config
   */
  open<T>(component: ComponentType<T>, config: MdDialogConfig): Promise<MdDialogRef<T>> {
    return this._createOverlay(config)
        .then(overlayRef => this._attachDialogContainer(overlayRef, config))
        .then(containerRef => this._attachDialogContent(component, containerRef));
  }

  /**
   * Creates the overlay into which the dialog will be loaded.
   * @param dialogConfig The dialog configuration.
   * @returns A promise resolving to the OverlayRef for the created overlay.
   */
  private _createOverlay(dialogConfig: MdDialogConfig): Promise<OverlayRef> {
    let overlayState = this._getOverlayState(dialogConfig);
    return this._overlay.create(overlayState);
  }

  /**
   * Attaches an MdDialogContainer to a dialog's already-created overlay.
   * @param overlayRef Reference to the dialog's underlying overlay.
   * @param config The dialog configuration.
   * @returns A promise resolving to a ComponentRef for the attached container.
   */
  private _attachDialogContainer(overlayRef: OverlayRef, config: MdDialogConfig):
      Promise<ComponentRef<MdDialogContainer>> {
    let containerPortal = new ComponentPortal(MdDialogContainer, config.viewContainerRef);
    return overlayRef.attach(containerPortal).then(containerRef => {
      // Pass the config directly to the container so that it can consume any relevant settings.
      containerRef.instance.dialogConfig = config;
      return containerRef;
    });
  }

  /**
   * Attaches the user-provided component to the already-created MdDialogContainer.
   * @param component The type of component being loaded into the dialog.
   * @param containerRef Reference to the wrapping MdDialogContainer.
   * @returns A promise resolving to the MdDialogRef that should be returned to the user.
   */
  private _attachDialogContent<T>(
      component: ComponentType<T>,
      containerRef: ComponentRef<MdDialogContainer>): Promise<MdDialogRef<T>> {
    let dialogContainer = containerRef.instance;

    // Create a reference to the dialog we're creating in order to give the user a handle
    // to modify and close it.
    let dialogRef = new MdDialogRef();

    // We create an injector specifically for the component we're instantiating so that it can
    // inject the MdDialogRef. This allows a component loaded inside of a dialog to close itself
    // and, optionally, to return a value.
    let dialogInjector = new DialogInjector(dialogRef, this._injector);

    let contentPortal = new ComponentPortal(component, null, dialogInjector);
    return dialogContainer.attachComponentPortal(contentPortal).then(contentRef => {
      dialogRef.componentInstance = contentRef.instance;
      return dialogRef;
    });
  }

  /**
   * Creates an overlay state from a dialog config.
   * @param dialogConfig The dialog configuration.
   * @returns The overlay configuration.
   */
  private _getOverlayState(dialogConfig: MdDialogConfig): OverlayState {
    let state = new OverlayState();

    state.positionStrategy = this._overlay.position()
        .global()
        .centerHorizontally()
        .centerVertically();

    return state;
  }
}

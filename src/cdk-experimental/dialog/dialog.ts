/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  TemplateRef,
  SkipSelf,
  Optional,
  Injectable,
  Injector,
  Inject,
  ComponentRef,
  OnDestroy,
  Type
} from '@angular/core';
import {ComponentPortal, PortalInjector, TemplatePortal} from '@angular/cdk/portal';
import {of as observableOf, Observable, Subject, defer} from 'rxjs';
import {DialogRef} from './dialog-ref';
import {Location} from '@angular/common';
import {DialogConfig} from './dialog-config';
import {Directionality} from '@angular/cdk/bidi';
import {CdkDialogContainer} from './dialog-container';
import {
  ComponentType,
  Overlay,
  OverlayRef,
  OverlayConfig,
  ScrollStrategy,
} from '@angular/cdk/overlay';
import {startWith} from 'rxjs/operators';

import {
  DIALOG_SCROLL_STRATEGY,
  DIALOG_DATA,
  DIALOG_REF,
  DIALOG_CONTAINER,
  DIALOG_CONFIG,
} from './dialog-injectors';


/**
 * Service to open modal dialogs.
 */
@Injectable()
export class Dialog implements OnDestroy {
  private _scrollStrategy: () => ScrollStrategy;

  /** Stream that emits when all dialogs are closed. */
  get _afterAllClosed(): Observable<void> {
    return this._parentDialog ? this._parentDialog.afterAllClosed : this._afterAllClosedBase;
  }
  _afterAllClosedBase = new Subject<void>();

  // TODO(jelbourn): tighten the type on the right-hand side of this expression.
  afterAllClosed: Observable<void> = defer<any>(() => this.openDialogs.length ?
      this._afterAllClosed : this._afterAllClosed.pipe(startWith<void>(undefined))) as any;

  /** Stream that emits when a dialog is opened. */
  get afterOpened(): Subject<DialogRef<any>> {
    return this._parentDialog ? this._parentDialog.afterOpened : this._afterOpened;
  }
  _afterOpened: Subject<DialogRef<any>> = new Subject();

  /** Stream that emits when a dialog is opened. */
  get openDialogs(): DialogRef<any>[] {
    return this._parentDialog ? this._parentDialog.openDialogs : this._openDialogs;
  }
  _openDialogs: DialogRef<any>[] = [];

  constructor(
      private overlay: Overlay,
      private injector: Injector,
      @Inject(DIALOG_REF) private dialogRefConstructor: Type<DialogRef<any>>,
      // TODO(crisbeto): the `any` here can be replaced
      // with the proper type once we start using Ivy.
      @Inject(DIALOG_SCROLL_STRATEGY) scrollStrategy: any,
      @Optional() @SkipSelf() private _parentDialog: Dialog,
      @Optional() location: Location) {

    // Close all of the dialogs when the user goes forwards/backwards in history or when the
    // location hash changes. Note that this usually doesn't include clicking on links (unless
    // the user is using the `HashLocationStrategy`).
    if (!_parentDialog && location) {
      location.subscribe(() => this.closeAll());
    }

    this._scrollStrategy = scrollStrategy;
  }

  /** Gets an open dialog by id. */
  getById(id: string): DialogRef<any> | undefined {
    return this._openDialogs.find(ref  => ref.id === id);
  }

  /** Closes all open dialogs. */
  closeAll(): void {
    this.openDialogs.forEach(ref => ref.close());
  }

  /** Opens a dialog from a component. */
  openFromComponent<T>(component: ComponentType<T>, config?: DialogConfig): DialogRef<any> {
    config = this._applyConfigDefaults(config);

    if (config.id && this.getById(config.id)) {
      throw Error(`Dialog with id "${config.id}" exists already. The dialog id must be unique.`);
    }

    const overlayRef = this._createOverlay(config);
    const dialogContainer = this._attachDialogContainer(overlayRef, config);
    const dialogRef = this._attachDialogContentForComponent(component, dialogContainer,
      overlayRef, config);

    this.registerDialogRef(dialogRef);
    return dialogRef;
  }

  /** Opens a dialog from a template. */
  openFromTemplate<T>(template: TemplateRef<T>, config?: DialogConfig): DialogRef<any> {
    config = this._applyConfigDefaults(config);

    if (config.id && this.getById(config.id)) {
      throw Error(`Dialog with id "${config.id}" exists already. The dialog id must be unique.`);
    }

    const overlayRef = this._createOverlay(config);
    const dialogContainer = this._attachDialogContainer(overlayRef, config);
    const dialogRef = this._attachDialogContentForTemplate(template, dialogContainer,
      overlayRef, config);

    this.registerDialogRef(dialogRef);
    return dialogRef;
  }

  ngOnDestroy() {
    // Only close all the dialogs at this level.
    this._openDialogs.forEach(ref => ref.close());
  }

  /**
   * Forwards emitting events for when dialogs are opened and all dialogs are closed.
   */
  private registerDialogRef(dialogRef: DialogRef<any>): void {
    this.openDialogs.push(dialogRef);

    const dialogOpenSub = dialogRef.afterOpened().subscribe(() => {
      this.afterOpened.next(dialogRef);
      dialogOpenSub.unsubscribe();
    });

    const dialogCloseSub = dialogRef.afterClosed().subscribe(() => {
      let dialogIndex = this._openDialogs.indexOf(dialogRef);

      if (dialogIndex > -1) {
        this._openDialogs.splice(dialogIndex, 1);
      }

      if (!this._openDialogs.length) {
        this._afterAllClosedBase.next();
        dialogCloseSub.unsubscribe();
      }
    });
  }

  /**
   * Creates an overlay config from a dialog config.
   * @param config The dialog configuration.
   * @returns The overlay configuration.
   */
  protected _createOverlay(config: DialogConfig): OverlayRef {
    const overlayConfig = new OverlayConfig({
      positionStrategy: this.overlay.position().global(),
      scrollStrategy: this._scrollStrategy(),
      panelClass: config.panelClass,
      hasBackdrop: config.hasBackdrop,
      direction: config.direction,
      minWidth: config.minWidth,
      minHeight: config.minHeight,
      maxWidth: config.maxWidth,
      maxHeight: config.maxHeight
    });

    if (config.backdropClass) {
      overlayConfig.backdropClass = config.backdropClass;
    }
    return this.overlay.create(overlayConfig);
  }

  /**
   * Attaches an MatDialogContainer to a dialog's already-created overlay.
   * @param overlay Reference to the dialog's underlying overlay.
   * @param config The dialog configuration.
   * @returns A promise resolving to a ComponentRef for the attached container.
   */
  protected _attachDialogContainer(overlay: OverlayRef, config: DialogConfig): CdkDialogContainer {
    const container = config.containerComponent || this.injector.get(DIALOG_CONTAINER);
    const userInjector = config && config.viewContainerRef && config.viewContainerRef.injector;
    const injector = new PortalInjector(userInjector || this.injector, new WeakMap([
      [DialogConfig, config]
    ]));
    const containerPortal = new ComponentPortal(container, config.viewContainerRef, injector);
    const containerRef: ComponentRef<CdkDialogContainer> = overlay.attach(containerPortal);
    containerRef.instance._config = config;

    return containerRef.instance;
  }


  /**
   * Attaches the user-provided component to the already-created MatDialogContainer.
   * @param componentOrTemplateRef The type of component being loaded into the dialog,
   *     or a TemplateRef to instantiate as the content.
   * @param dialogContainer Reference to the wrapping MatDialogContainer.
   * @param overlayRef Reference to the overlay in which the dialog resides.
   * @param config The dialog configuration.
   * @returns A promise resolving to the MatDialogRef that should be returned to the user.
   */
  protected _attachDialogContentForComponent<T>(
      componentOrTemplateRef: ComponentType<T>,
      dialogContainer: CdkDialogContainer,
      overlayRef: OverlayRef,
      config: DialogConfig): DialogRef<any> {

    // Create a reference to the dialog we're creating in order to give the user a handle
    // to modify and close it.
    const dialogRef = new this.dialogRefConstructor(overlayRef, dialogContainer, config.id);
    const injector = this._createInjector<T>(config, dialogRef, dialogContainer);
    const contentRef = dialogContainer.attachComponentPortal(
        new ComponentPortal(componentOrTemplateRef, undefined, injector));

    dialogRef.componentInstance = contentRef.instance;
    dialogRef.disableClose = config.disableClose;

    dialogRef.updateSize({width: config.width, height: config.height})
             .updatePosition(config.position);

    return dialogRef;
  }

  /**
   * Attaches the user-provided component to the already-created MatDialogContainer.
   * @param componentOrTemplateRef The type of component being loaded into the dialog,
   *     or a TemplateRef to instantiate as the content.
   * @param dialogContainer Reference to the wrapping MatDialogContainer.
   * @param overlayRef Reference to the overlay in which the dialog resides.
   * @param config The dialog configuration.
   * @returns A promise resolving to the MatDialogRef that should be returned to the user.
   */
  protected _attachDialogContentForTemplate<T>(
      componentOrTemplateRef: TemplateRef<T>,
      dialogContainer: CdkDialogContainer,
      overlayRef: OverlayRef,
      config: DialogConfig): DialogRef<any> {

    // Create a reference to the dialog we're creating in order to give the user a handle
    // to modify and close it.
    const dialogRef = new this.dialogRefConstructor(overlayRef, dialogContainer, config.id);

    dialogContainer.attachTemplatePortal(
      new TemplatePortal<T>(componentOrTemplateRef, null!,
        <any>{$implicit: config.data, dialogRef}));
    dialogRef.updateSize({width: config.width, height: config.height})
             .updatePosition(config.position);

    return dialogRef;
  }


  /**
   * Creates a custom injector to be used inside the dialog. This allows a component loaded inside
   * of a dialog to close itself and, optionally, to return a value.
   * @param config Config object that is used to construct the dialog.
   * @param dialogRef Reference to the dialog.
   * @param container Dialog container element that wraps all of the contents.
   * @returns The custom injector that can be used inside the dialog.
   */
  private _createInjector<T>(
      config: DialogConfig,
      dialogRef: DialogRef<T>,
      dialogContainer: CdkDialogContainer): PortalInjector {

    const userInjector = config && config.viewContainerRef && config.viewContainerRef.injector;
    const injectionTokens = new WeakMap<any, any>([
      [this.injector.get(DIALOG_REF), dialogRef],
      [this.injector.get(DIALOG_CONTAINER), dialogContainer],
      [DIALOG_DATA, config.data]
    ]);

    if (config.direction &&
        (!userInjector || !userInjector.get<Directionality | null>(Directionality, null))) {
      injectionTokens.set(Directionality, {
        value: config.direction,
        change: observableOf()
      });
    }

    return new PortalInjector(userInjector || this.injector, injectionTokens);
  }

  /**
   * Expands the provided configuration object to include the default values for properties which
   * are undefined.
   */
  private _applyConfigDefaults(config?: DialogConfig): DialogConfig {
    const dialogConfig = this.injector.get(DIALOG_CONFIG) as typeof DialogConfig;
    return {...new dialogConfig(), ...config};
  }
}

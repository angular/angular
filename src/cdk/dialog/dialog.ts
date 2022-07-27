/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  TemplateRef,
  Injectable,
  Injector,
  OnDestroy,
  Type,
  StaticProvider,
  InjectFlags,
  Inject,
  Optional,
  SkipSelf,
} from '@angular/core';
import {BasePortalOutlet, ComponentPortal, TemplatePortal} from '@angular/cdk/portal';
import {of as observableOf, Observable, Subject, defer} from 'rxjs';
import {DialogRef} from './dialog-ref';
import {DialogConfig} from './dialog-config';
import {Directionality} from '@angular/cdk/bidi';
import {
  ComponentType,
  Overlay,
  OverlayRef,
  OverlayConfig,
  ScrollStrategy,
  OverlayContainer,
} from '@angular/cdk/overlay';
import {startWith} from 'rxjs/operators';

import {DEFAULT_DIALOG_CONFIG, DIALOG_DATA, DIALOG_SCROLL_STRATEGY} from './dialog-injectors';
import {CdkDialogContainer} from './dialog-container';

/** Unique id for the created dialog. */
let uniqueId = 0;

@Injectable()
export class Dialog implements OnDestroy {
  private _openDialogsAtThisLevel: DialogRef<any, any>[] = [];
  private readonly _afterAllClosedAtThisLevel = new Subject<void>();
  private readonly _afterOpenedAtThisLevel = new Subject<DialogRef>();
  private _ariaHiddenElements = new Map<Element, string | null>();
  private _scrollStrategy: () => ScrollStrategy;

  /** Keeps track of the currently-open dialogs. */
  get openDialogs(): readonly DialogRef<any, any>[] {
    return this._parentDialog ? this._parentDialog.openDialogs : this._openDialogsAtThisLevel;
  }

  /** Stream that emits when a dialog has been opened. */
  get afterOpened(): Subject<DialogRef<any, any>> {
    return this._parentDialog ? this._parentDialog.afterOpened : this._afterOpenedAtThisLevel;
  }

  /**
   * Stream that emits when all open dialog have finished closing.
   * Will emit on subscribe if there are no open dialogs to begin with.
   */
  readonly afterAllClosed: Observable<void> = defer(() =>
    this.openDialogs.length
      ? this._getAfterAllClosed()
      : this._getAfterAllClosed().pipe(startWith(undefined)),
  );

  constructor(
    private _overlay: Overlay,
    private _injector: Injector,
    @Optional() @Inject(DEFAULT_DIALOG_CONFIG) private _defaultOptions: DialogConfig,
    @Optional() @SkipSelf() private _parentDialog: Dialog,
    private _overlayContainer: OverlayContainer,
    @Inject(DIALOG_SCROLL_STRATEGY) scrollStrategy: any,
  ) {
    this._scrollStrategy = scrollStrategy;
  }

  /**
   * Opens a modal dialog containing the given component.
   * @param component Type of the component to load into the dialog.
   * @param config Extra configuration options.
   * @returns Reference to the newly-opened dialog.
   */
  open<R = unknown, D = unknown, C = unknown>(
    component: ComponentType<C>,
    config?: DialogConfig<D, DialogRef<R, C>>,
  ): DialogRef<R, C>;

  /**
   * Opens a modal dialog containing the given template.
   * @param template TemplateRef to instantiate as the dialog content.
   * @param config Extra configuration options.
   * @returns Reference to the newly-opened dialog.
   */
  open<R = unknown, D = unknown, C = unknown>(
    template: TemplateRef<C>,
    config?: DialogConfig<D, DialogRef<R, C>>,
  ): DialogRef<R, C>;

  open<R = unknown, D = unknown, C = unknown>(
    componentOrTemplateRef: ComponentType<C> | TemplateRef<C>,
    config?: DialogConfig<D, DialogRef<R, C>>,
  ): DialogRef<R, C>;

  open<R = unknown, D = unknown, C = unknown>(
    componentOrTemplateRef: ComponentType<C> | TemplateRef<C>,
    config?: DialogConfig<D, DialogRef<R, C>>,
  ): DialogRef<R, C> {
    const defaults = (this._defaultOptions || new DialogConfig()) as DialogConfig<
      D,
      DialogRef<R, C>
    >;
    config = {...defaults, ...config};
    config.id = config.id || `cdk-dialog-${uniqueId++}`;

    if (
      config.id &&
      this.getDialogById(config.id) &&
      (typeof ngDevMode === 'undefined' || ngDevMode)
    ) {
      throw Error(`Dialog with id "${config.id}" exists already. The dialog id must be unique.`);
    }

    const overlayConfig = this._getOverlayConfig(config);
    const overlayRef = this._overlay.create(overlayConfig);
    const dialogRef = new DialogRef(overlayRef, config);
    const dialogContainer = this._attachContainer(overlayRef, dialogRef, config);

    (dialogRef as {containerInstance: BasePortalOutlet}).containerInstance = dialogContainer;
    this._attachDialogContent(componentOrTemplateRef, dialogRef, dialogContainer, config);

    // If this is the first dialog that we're opening, hide all the non-overlay content.
    if (!this.openDialogs.length) {
      this._hideNonDialogContentFromAssistiveTechnology();
    }

    (this.openDialogs as DialogRef<R, C>[]).push(dialogRef);
    dialogRef.closed.subscribe(() => this._removeOpenDialog(dialogRef, true));
    this.afterOpened.next(dialogRef);

    return dialogRef;
  }

  /**
   * Closes all of the currently-open dialogs.
   */
  closeAll(): void {
    reverseForEach(this.openDialogs, dialog => dialog.close());
  }

  /**
   * Finds an open dialog by its id.
   * @param id ID to use when looking up the dialog.
   */
  getDialogById<R, C>(id: string): DialogRef<R, C> | undefined {
    return this.openDialogs.find(dialog => dialog.id === id);
  }

  ngOnDestroy() {
    // Make one pass over all the dialogs that need to be untracked, but should not be closed. We
    // want to stop tracking the open dialog even if it hasn't been closed, because the tracking
    // determines when `aria-hidden` is removed from elements outside the dialog.
    reverseForEach(this._openDialogsAtThisLevel, dialog => {
      // Check for `false` specifically since we want `undefined` to be interpreted as `true`.
      if (dialog.config.closeOnDestroy === false) {
        this._removeOpenDialog(dialog, false);
      }
    });

    // Make a second pass and close the remaining dialogs. We do this second pass in order to
    // correctly dispatch the `afterAllClosed` event in case we have a mixed array of dialogs
    // that should be closed and dialogs that should not.
    reverseForEach(this._openDialogsAtThisLevel, dialog => dialog.close());

    this._afterAllClosedAtThisLevel.complete();
    this._afterOpenedAtThisLevel.complete();
    this._openDialogsAtThisLevel = [];
  }

  /**
   * Creates an overlay config from a dialog config.
   * @param config The dialog configuration.
   * @returns The overlay configuration.
   */
  private _getOverlayConfig<D, R>(config: DialogConfig<D, R>): OverlayConfig {
    const state = new OverlayConfig({
      positionStrategy:
        config.positionStrategy ||
        this._overlay.position().global().centerHorizontally().centerVertically(),
      scrollStrategy: config.scrollStrategy || this._scrollStrategy(),
      panelClass: config.panelClass,
      hasBackdrop: config.hasBackdrop,
      direction: config.direction,
      minWidth: config.minWidth,
      minHeight: config.minHeight,
      maxWidth: config.maxWidth,
      maxHeight: config.maxHeight,
      width: config.width,
      height: config.height,
      disposeOnNavigation: config.closeOnNavigation,
    });

    if (config.backdropClass) {
      state.backdropClass = config.backdropClass;
    }

    return state;
  }

  /**
   * Attaches a dialog container to a dialog's already-created overlay.
   * @param overlay Reference to the dialog's underlying overlay.
   * @param config The dialog configuration.
   * @returns A promise resolving to a ComponentRef for the attached container.
   */
  private _attachContainer<R, D, C>(
    overlay: OverlayRef,
    dialogRef: DialogRef<R, C>,
    config: DialogConfig<D, DialogRef<R, C>>,
  ): BasePortalOutlet {
    const userInjector = config.injector ?? config.viewContainerRef?.injector;
    const providers: StaticProvider[] = [
      {provide: DialogConfig, useValue: config},
      {provide: DialogRef, useValue: dialogRef},
      {provide: OverlayRef, useValue: overlay},
    ];
    let containerType: Type<BasePortalOutlet>;

    if (config.container) {
      if (typeof config.container === 'function') {
        containerType = config.container;
      } else {
        containerType = config.container.type;
        providers.push(...config.container.providers(config));
      }
    } else {
      containerType = CdkDialogContainer;
    }

    const containerPortal = new ComponentPortal(
      containerType,
      config.viewContainerRef,
      Injector.create({parent: userInjector || this._injector, providers}),
      config.componentFactoryResolver,
    );
    const containerRef = overlay.attach(containerPortal);

    return containerRef.instance;
  }

  /**
   * Attaches the user-provided component to the already-created dialog container.
   * @param componentOrTemplateRef The type of component being loaded into the dialog,
   *     or a TemplateRef to instantiate as the content.
   * @param dialogRef Reference to the dialog being opened.
   * @param dialogContainer Component that is going to wrap the dialog content.
   * @param config Configuration used to open the dialog.
   */
  private _attachDialogContent<R, D, C>(
    componentOrTemplateRef: ComponentType<C> | TemplateRef<C>,
    dialogRef: DialogRef<R, C>,
    dialogContainer: BasePortalOutlet,
    config: DialogConfig<D, DialogRef<R, C>>,
  ) {
    const injector = this._createInjector(config, dialogRef, dialogContainer);

    if (componentOrTemplateRef instanceof TemplateRef) {
      let context: any = {$implicit: config.data, dialogRef};

      if (config.templateContext) {
        context = {
          ...context,
          ...(typeof config.templateContext === 'function'
            ? config.templateContext()
            : config.templateContext),
        };
      }

      dialogContainer.attachTemplatePortal(
        new TemplatePortal<C>(componentOrTemplateRef, null!, context, injector),
      );
    } else {
      const contentRef = dialogContainer.attachComponentPortal<C>(
        new ComponentPortal(
          componentOrTemplateRef,
          config.viewContainerRef,
          injector,
          config.componentFactoryResolver,
        ),
      );
      (dialogRef as {componentInstance: C}).componentInstance = contentRef.instance;
    }
  }

  /**
   * Creates a custom injector to be used inside the dialog. This allows a component loaded inside
   * of a dialog to close itself and, optionally, to return a value.
   * @param config Config object that is used to construct the dialog.
   * @param dialogRef Reference to the dialog being opened.
   * @param dialogContainer Component that is going to wrap the dialog content.
   * @returns The custom injector that can be used inside the dialog.
   */
  private _createInjector<R, D, C>(
    config: DialogConfig<D, DialogRef<R, C>>,
    dialogRef: DialogRef<R, C>,
    dialogContainer: BasePortalOutlet,
  ): Injector {
    const userInjector = config && config.viewContainerRef && config.viewContainerRef.injector;
    const providers: StaticProvider[] = [
      {provide: DIALOG_DATA, useValue: config.data},
      {provide: DialogRef, useValue: dialogRef},
    ];

    if (config.providers) {
      if (typeof config.providers === 'function') {
        providers.push(...config.providers(dialogRef, config, dialogContainer));
      } else {
        providers.push(...config.providers);
      }
    }

    if (
      config.direction &&
      (!userInjector ||
        !userInjector.get<Directionality | null>(Directionality, null, InjectFlags.Optional))
    ) {
      providers.push({
        provide: Directionality,
        useValue: {value: config.direction, change: observableOf()},
      });
    }

    return Injector.create({parent: config.injector || userInjector || this._injector, providers});
  }

  /**
   * Removes a dialog from the array of open dialogs.
   * @param dialogRef Dialog to be removed.
   * @param emitEvent Whether to emit an event if this is the last dialog.
   */
  private _removeOpenDialog<R, C>(dialogRef: DialogRef<R, C>, emitEvent: boolean) {
    const index = this.openDialogs.indexOf(dialogRef);

    if (index > -1) {
      (this.openDialogs as DialogRef<R, C>[]).splice(index, 1);

      // If all the dialogs were closed, remove/restore the `aria-hidden`
      // to a the siblings and emit to the `afterAllClosed` stream.
      if (!this.openDialogs.length) {
        this._ariaHiddenElements.forEach((previousValue, element) => {
          if (previousValue) {
            element.setAttribute('aria-hidden', previousValue);
          } else {
            element.removeAttribute('aria-hidden');
          }
        });

        this._ariaHiddenElements.clear();

        if (emitEvent) {
          this._getAfterAllClosed().next();
        }
      }
    }
  }

  /** Hides all of the content that isn't an overlay from assistive technology. */
  private _hideNonDialogContentFromAssistiveTechnology() {
    const overlayContainer = this._overlayContainer.getContainerElement();

    // Ensure that the overlay container is attached to the DOM.
    if (overlayContainer.parentElement) {
      const siblings = overlayContainer.parentElement.children;

      for (let i = siblings.length - 1; i > -1; i--) {
        const sibling = siblings[i];

        if (
          sibling !== overlayContainer &&
          sibling.nodeName !== 'SCRIPT' &&
          sibling.nodeName !== 'STYLE' &&
          !sibling.hasAttribute('aria-live')
        ) {
          this._ariaHiddenElements.set(sibling, sibling.getAttribute('aria-hidden'));
          sibling.setAttribute('aria-hidden', 'true');
        }
      }
    }
  }

  private _getAfterAllClosed(): Subject<void> {
    const parent = this._parentDialog;
    return parent ? parent._getAfterAllClosed() : this._afterAllClosedAtThisLevel;
  }
}

/**
 * Executes a callback against all elements in an array while iterating in reverse.
 * Useful if the array is being modified as it is being iterated.
 */
function reverseForEach<T>(items: T[] | readonly T[], callback: (current: T) => void) {
  let i = items.length;

  while (i--) {
    callback(items[i]);
  }
}

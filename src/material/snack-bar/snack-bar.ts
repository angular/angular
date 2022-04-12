/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {LiveAnnouncer} from '@angular/cdk/a11y';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {Overlay, OverlayConfig, OverlayRef} from '@angular/cdk/overlay';
import {ComponentPortal, ComponentType, TemplatePortal} from '@angular/cdk/portal';
import {
  ComponentRef,
  EmbeddedViewRef,
  Inject,
  Injectable,
  InjectionToken,
  Injector,
  Optional,
  SkipSelf,
  TemplateRef,
  OnDestroy,
  Type,
} from '@angular/core';
import {takeUntil} from 'rxjs/operators';
import {TextOnlySnackBar, SimpleSnackBar} from './simple-snack-bar';
import {MAT_SNACK_BAR_DATA, MatSnackBarConfig} from './snack-bar-config';
import {MatSnackBarContainer, _SnackBarContainer} from './snack-bar-container';
import {MatSnackBarModule} from './snack-bar-module';
import {MatSnackBarRef} from './snack-bar-ref';

/** Injection token that can be used to specify default snack bar. */
export const MAT_SNACK_BAR_DEFAULT_OPTIONS = new InjectionToken<MatSnackBarConfig>(
  'mat-snack-bar-default-options',
  {
    providedIn: 'root',
    factory: MAT_SNACK_BAR_DEFAULT_OPTIONS_FACTORY,
  },
);

/** @docs-private */
export function MAT_SNACK_BAR_DEFAULT_OPTIONS_FACTORY(): MatSnackBarConfig {
  return new MatSnackBarConfig();
}

@Injectable()
export abstract class _MatSnackBarBase implements OnDestroy {
  /**
   * Reference to the current snack bar in the view *at this level* (in the Angular injector tree).
   * If there is a parent snack-bar service, all operations should delegate to that parent
   * via `_openedSnackBarRef`.
   */
  private _snackBarRefAtThisLevel: MatSnackBarRef<any> | null = null;

  /** The component that should be rendered as the snack bar's simple component. */
  protected abstract simpleSnackBarComponent: Type<TextOnlySnackBar>;

  /** The container component that attaches the provided template or component. */
  protected abstract snackBarContainerComponent: Type<_SnackBarContainer>;

  /** The CSS class to apply for handset mode. */
  protected abstract handsetCssClass: string;

  /** Reference to the currently opened snackbar at *any* level. */
  get _openedSnackBarRef(): MatSnackBarRef<any> | null {
    const parent = this._parentSnackBar;
    return parent ? parent._openedSnackBarRef : this._snackBarRefAtThisLevel;
  }

  set _openedSnackBarRef(value: MatSnackBarRef<any> | null) {
    if (this._parentSnackBar) {
      this._parentSnackBar._openedSnackBarRef = value;
    } else {
      this._snackBarRefAtThisLevel = value;
    }
  }

  constructor(
    private _overlay: Overlay,
    private _live: LiveAnnouncer,
    private _injector: Injector,
    private _breakpointObserver: BreakpointObserver,
    @Optional() @SkipSelf() private _parentSnackBar: _MatSnackBarBase,
    @Inject(MAT_SNACK_BAR_DEFAULT_OPTIONS) private _defaultConfig: MatSnackBarConfig,
  ) {}

  /**
   * Creates and dispatches a snack bar with a custom component for the content, removing any
   * currently opened snack bars.
   *
   * @param component Component to be instantiated.
   * @param config Extra configuration for the snack bar.
   */
  openFromComponent<T, D = any>(
    component: ComponentType<T>,
    config?: MatSnackBarConfig<D>,
  ): MatSnackBarRef<T> {
    return this._attach(component, config) as MatSnackBarRef<T>;
  }

  /**
   * Creates and dispatches a snack bar with a custom template for the content, removing any
   * currently opened snack bars.
   *
   * @param template Template to be instantiated.
   * @param config Extra configuration for the snack bar.
   */
  openFromTemplate(
    template: TemplateRef<any>,
    config?: MatSnackBarConfig,
  ): MatSnackBarRef<EmbeddedViewRef<any>> {
    return this._attach(template, config);
  }

  /**
   * Opens a snackbar with a message and an optional action.
   * @param message The message to show in the snackbar.
   * @param action The label for the snackbar action.
   * @param config Additional configuration options for the snackbar.
   */
  open(
    message: string,
    action: string = '',
    config?: MatSnackBarConfig,
  ): MatSnackBarRef<TextOnlySnackBar> {
    const _config = {...this._defaultConfig, ...config};

    // Since the user doesn't have access to the component, we can
    // override the data to pass in our own message and action.
    _config.data = {message, action};

    // Since the snack bar has `role="alert"`, we don't
    // want to announce the same message twice.
    if (_config.announcementMessage === message) {
      _config.announcementMessage = undefined;
    }

    return this.openFromComponent(this.simpleSnackBarComponent, _config);
  }

  /**
   * Dismisses the currently-visible snack bar.
   */
  dismiss(): void {
    if (this._openedSnackBarRef) {
      this._openedSnackBarRef.dismiss();
    }
  }

  ngOnDestroy() {
    // Only dismiss the snack bar at the current level on destroy.
    if (this._snackBarRefAtThisLevel) {
      this._snackBarRefAtThisLevel.dismiss();
    }
  }

  /**
   * Attaches the snack bar container component to the overlay.
   */
  private _attachSnackBarContainer(
    overlayRef: OverlayRef,
    config: MatSnackBarConfig,
  ): _SnackBarContainer {
    const userInjector = config && config.viewContainerRef && config.viewContainerRef.injector;
    const injector = Injector.create({
      parent: userInjector || this._injector,
      providers: [{provide: MatSnackBarConfig, useValue: config}],
    });

    const containerPortal = new ComponentPortal(
      this.snackBarContainerComponent,
      config.viewContainerRef,
      injector,
    );
    const containerRef: ComponentRef<_SnackBarContainer> = overlayRef.attach(containerPortal);
    containerRef.instance.snackBarConfig = config;
    return containerRef.instance;
  }

  /**
   * Places a new component or a template as the content of the snack bar container.
   */
  private _attach<T>(
    content: ComponentType<T> | TemplateRef<T>,
    userConfig?: MatSnackBarConfig,
  ): MatSnackBarRef<T | EmbeddedViewRef<any>> {
    const config = {...new MatSnackBarConfig(), ...this._defaultConfig, ...userConfig};
    const overlayRef = this._createOverlay(config);
    const container = this._attachSnackBarContainer(overlayRef, config);
    const snackBarRef = new MatSnackBarRef<T | EmbeddedViewRef<any>>(container, overlayRef);

    if (content instanceof TemplateRef) {
      const portal = new TemplatePortal(content, null!, {
        $implicit: config.data,
        snackBarRef,
      } as any);

      snackBarRef.instance = container.attachTemplatePortal(portal);
    } else {
      const injector = this._createInjector(config, snackBarRef);
      const portal = new ComponentPortal(content, undefined, injector);
      const contentRef = container.attachComponentPortal<T>(portal);

      // We can't pass this via the injector, because the injector is created earlier.
      snackBarRef.instance = contentRef.instance;
    }

    // Subscribe to the breakpoint observer and attach the mat-snack-bar-handset class as
    // appropriate. This class is applied to the overlay element because the overlay must expand to
    // fill the width of the screen for full width snackbars.
    this._breakpointObserver
      .observe(Breakpoints.HandsetPortrait)
      .pipe(takeUntil(overlayRef.detachments()))
      .subscribe(state => {
        overlayRef.overlayElement.classList.toggle(this.handsetCssClass, state.matches);
      });

    if (config.announcementMessage) {
      // Wait until the snack bar contents have been announced then deliver this message.
      container._onAnnounce.subscribe(() => {
        this._live.announce(config.announcementMessage!, config.politeness);
      });
    }

    this._animateSnackBar(snackBarRef, config);
    this._openedSnackBarRef = snackBarRef;
    return this._openedSnackBarRef;
  }

  /** Animates the old snack bar out and the new one in. */
  private _animateSnackBar(snackBarRef: MatSnackBarRef<any>, config: MatSnackBarConfig) {
    // When the snackbar is dismissed, clear the reference to it.
    snackBarRef.afterDismissed().subscribe(() => {
      // Clear the snackbar ref if it hasn't already been replaced by a newer snackbar.
      if (this._openedSnackBarRef == snackBarRef) {
        this._openedSnackBarRef = null;
      }

      if (config.announcementMessage) {
        this._live.clear();
      }
    });

    if (this._openedSnackBarRef) {
      // If a snack bar is already in view, dismiss it and enter the
      // new snack bar after exit animation is complete.
      this._openedSnackBarRef.afterDismissed().subscribe(() => {
        snackBarRef.containerInstance.enter();
      });
      this._openedSnackBarRef.dismiss();
    } else {
      // If no snack bar is in view, enter the new snack bar.
      snackBarRef.containerInstance.enter();
    }

    // If a dismiss timeout is provided, set up dismiss based on after the snackbar is opened.
    if (config.duration && config.duration > 0) {
      snackBarRef.afterOpened().subscribe(() => snackBarRef._dismissAfter(config.duration!));
    }
  }

  /**
   * Creates a new overlay and places it in the correct location.
   * @param config The user-specified snack bar config.
   */
  private _createOverlay(config: MatSnackBarConfig): OverlayRef {
    const overlayConfig = new OverlayConfig();
    overlayConfig.direction = config.direction;

    let positionStrategy = this._overlay.position().global();
    // Set horizontal position.
    const isRtl = config.direction === 'rtl';
    const isLeft =
      config.horizontalPosition === 'left' ||
      (config.horizontalPosition === 'start' && !isRtl) ||
      (config.horizontalPosition === 'end' && isRtl);
    const isRight = !isLeft && config.horizontalPosition !== 'center';
    if (isLeft) {
      positionStrategy.left('0');
    } else if (isRight) {
      positionStrategy.right('0');
    } else {
      positionStrategy.centerHorizontally();
    }
    // Set horizontal position.
    if (config.verticalPosition === 'top') {
      positionStrategy.top('0');
    } else {
      positionStrategy.bottom('0');
    }

    overlayConfig.positionStrategy = positionStrategy;
    return this._overlay.create(overlayConfig);
  }

  /**
   * Creates an injector to be used inside of a snack bar component.
   * @param config Config that was used to create the snack bar.
   * @param snackBarRef Reference to the snack bar.
   */
  private _createInjector<T>(config: MatSnackBarConfig, snackBarRef: MatSnackBarRef<T>): Injector {
    const userInjector = config && config.viewContainerRef && config.viewContainerRef.injector;

    return Injector.create({
      parent: userInjector || this._injector,
      providers: [
        {provide: MatSnackBarRef, useValue: snackBarRef},
        {provide: MAT_SNACK_BAR_DATA, useValue: config.data},
      ],
    });
  }
}

/**
 * Service to dispatch Material Design snack bar messages.
 */
@Injectable({providedIn: MatSnackBarModule})
export class MatSnackBar extends _MatSnackBarBase {
  protected simpleSnackBarComponent = SimpleSnackBar;
  protected snackBarContainerComponent = MatSnackBarContainer;
  protected handsetCssClass = 'mat-snack-bar-handset';

  constructor(
    overlay: Overlay,
    live: LiveAnnouncer,
    injector: Injector,
    breakpointObserver: BreakpointObserver,
    @Optional() @SkipSelf() parentSnackBar: MatSnackBar,
    @Inject(MAT_SNACK_BAR_DEFAULT_OPTIONS) defaultConfig: MatSnackBarConfig,
  ) {
    super(overlay, live, injector, breakpointObserver, parentSnackBar, defaultConfig);
  }
}

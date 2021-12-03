/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  AfterViewInit,
  Directive,
  ElementRef,
  Injector,
  NgZone,
  OnDestroy,
  Type,
  ViewContainerRef,
  ChangeDetectorRef,
} from '@angular/core';
import {Directionality} from '@angular/cdk/bidi';
import {ComponentPortal} from '@angular/cdk/portal';
import {Overlay, OverlayRef} from '@angular/cdk/overlay';
import {CdkColumnDef, _CoalescedStyleScheduler} from '@angular/cdk/table';
import {merge, Subject} from 'rxjs';
import {filter, takeUntil} from 'rxjs/operators';

import {_closest} from '@angular/cdk-experimental/popover-edit';

import {HEADER_ROW_SELECTOR} from './selectors';
import {ResizeOverlayHandle} from './overlay-handle';
import {ColumnResize} from './column-resize';
import {ColumnSizeAction, ColumnResizeNotifierSource} from './column-resize-notifier';
import {HeaderRowEventDispatcher} from './event-dispatcher';
import {ResizeRef} from './resize-ref';
import {ResizeStrategy} from './resize-strategy';

const OVERLAY_ACTIVE_CLASS = 'cdk-resizable-overlay-thumb-active';

/**
 * Base class for Resizable directives which are applied to column headers to make those columns
 * resizable.
 */
@Directive()
export abstract class Resizable<HandleComponent extends ResizeOverlayHandle>
  implements AfterViewInit, OnDestroy
{
  protected minWidthPxInternal: number = 0;
  protected maxWidthPxInternal: number = Number.MAX_SAFE_INTEGER;

  protected inlineHandle?: HTMLElement;
  protected overlayRef?: OverlayRef;
  protected readonly destroyed = new Subject<void>();

  protected abstract readonly columnDef: CdkColumnDef;
  protected abstract readonly columnResize: ColumnResize;
  protected abstract readonly directionality: Directionality;
  protected abstract readonly document: Document;
  protected abstract readonly elementRef: ElementRef;
  protected abstract readonly eventDispatcher: HeaderRowEventDispatcher;
  protected abstract readonly injector: Injector;
  protected abstract readonly ngZone: NgZone;
  protected abstract readonly overlay: Overlay;
  protected abstract readonly resizeNotifier: ColumnResizeNotifierSource;
  protected abstract readonly resizeStrategy: ResizeStrategy;
  protected abstract readonly styleScheduler: _CoalescedStyleScheduler;
  protected abstract readonly viewContainerRef: ViewContainerRef;
  protected abstract readonly changeDetectorRef: ChangeDetectorRef;

  private _viewInitialized = false;
  private _isDestroyed = false;

  /** The minimum width to allow the column to be sized to. */
  get minWidthPx(): number {
    return this.minWidthPxInternal;
  }
  set minWidthPx(value: number) {
    this.minWidthPxInternal = value;

    this.columnResize.setResized();
    if (this.elementRef.nativeElement && this._viewInitialized) {
      this._applyMinWidthPx();
    }
  }

  /** The maximum width to allow the column to be sized to. */
  get maxWidthPx(): number {
    return this.maxWidthPxInternal;
  }
  set maxWidthPx(value: number) {
    this.maxWidthPxInternal = value;

    this.columnResize.setResized();
    if (this.elementRef.nativeElement && this._viewInitialized) {
      this._applyMaxWidthPx();
    }
  }

  ngAfterViewInit() {
    this._listenForRowHoverEvents();
    this._listenForResizeEvents();
    this._appendInlineHandle();

    this.styleScheduler.scheduleEnd(() => {
      if (this._isDestroyed) return;
      this._viewInitialized = true;
      this._applyMinWidthPx();
      this._applyMaxWidthPx();
    });
  }

  ngOnDestroy(): void {
    this._isDestroyed = true;
    this.destroyed.next();
    this.destroyed.complete();
    this.inlineHandle?.remove();
    this.overlayRef?.dispose();
  }

  protected abstract getInlineHandleCssClassName(): string;

  protected abstract getOverlayHandleComponentType(): Type<HandleComponent>;

  private _createOverlayForHandle(): OverlayRef {
    // Use of overlays allows us to properly capture click events spanning parts
    // of two table cells and is also useful for displaying a resize thumb
    // over both cells and extending it down the table as needed.

    const isRtl = this.directionality.value === 'rtl';
    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(this.elementRef.nativeElement!)
      .withFlexibleDimensions(false)
      .withGrowAfterOpen(false)
      .withPush(false)
      .withDefaultOffsetX(isRtl ? 1 : 0)
      .withPositions([
        {
          originX: isRtl ? 'start' : 'end',
          originY: 'top',
          overlayX: 'center',
          overlayY: 'top',
        },
      ]);

    return this.overlay.create({
      // Always position the overlay based on left-indexed coordinates.
      direction: 'ltr',
      disposeOnNavigation: true,
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      width: '16px',
    });
  }

  private _listenForRowHoverEvents(): void {
    const element = this.elementRef.nativeElement!;
    const takeUntilDestroyed = takeUntil<boolean>(this.destroyed);

    this.eventDispatcher
      .resizeOverlayVisibleForHeaderRow(_closest(element, HEADER_ROW_SELECTOR)!)
      .pipe(takeUntilDestroyed)
      .subscribe(hoveringRow => {
        if (hoveringRow) {
          if (!this.overlayRef) {
            this.overlayRef = this._createOverlayForHandle();
          }

          this._showHandleOverlay();
        } else if (this.overlayRef) {
          // todo - can't detach during an active resize - need to work that out
          this.overlayRef.detach();
        }
      });
  }

  private _listenForResizeEvents() {
    const takeUntilDestroyed = takeUntil<ColumnSizeAction>(this.destroyed);

    merge(this.resizeNotifier.resizeCanceled, this.resizeNotifier.triggerResize)
      .pipe(
        takeUntilDestroyed,
        filter(columnSize => columnSize.columnId === this.columnDef.name),
      )
      .subscribe(({size, previousSize, completeImmediately}) => {
        this.elementRef.nativeElement!.classList.add(OVERLAY_ACTIVE_CLASS);
        this._applySize(size, previousSize);

        if (completeImmediately) {
          this._completeResizeOperation();
        }
      });

    merge(this.resizeNotifier.resizeCanceled, this.resizeNotifier.resizeCompleted)
      .pipe(takeUntilDestroyed)
      .subscribe(columnSize => {
        this._cleanUpAfterResize(columnSize);
      });
  }

  private _completeResizeOperation(): void {
    this.ngZone.run(() => {
      this.resizeNotifier.resizeCompleted.next({
        columnId: this.columnDef.name,
        size: this.elementRef.nativeElement!.offsetWidth,
      });
    });
  }

  private _cleanUpAfterResize(columnSize: ColumnSizeAction): void {
    this.elementRef.nativeElement!.classList.remove(OVERLAY_ACTIVE_CLASS);

    if (this.overlayRef && this.overlayRef.hasAttached()) {
      this._updateOverlayHandleHeight();
      this.overlayRef.updatePosition();

      if (columnSize.columnId === this.columnDef.name) {
        this.inlineHandle!.focus();
      }
    }
  }

  private _createHandlePortal(): ComponentPortal<HandleComponent> {
    const injector = Injector.create({
      parent: this.injector,
      providers: [
        {
          provide: ResizeRef,
          useValue: new ResizeRef(
            this.elementRef,
            this.overlayRef!,
            this.minWidthPx,
            this.maxWidthPx,
          ),
        },
      ],
    });

    return new ComponentPortal(
      this.getOverlayHandleComponentType(),
      this.viewContainerRef,
      injector,
    );
  }

  private _showHandleOverlay(): void {
    this._updateOverlayHandleHeight();
    this.overlayRef!.attach(this._createHandlePortal());

    // Needed to ensure that all of the lifecycle hooks inside the overlay run immediately.
    this.changeDetectorRef.markForCheck();
  }

  private _updateOverlayHandleHeight() {
    this.overlayRef!.updateSize({height: this.elementRef.nativeElement!.offsetHeight});
  }

  private _applySize(sizeInPixels: number, previousSize?: number): void {
    const sizeToApply = Math.min(Math.max(sizeInPixels, this.minWidthPx, 0), this.maxWidthPx);

    this.resizeStrategy.applyColumnSize(
      this.columnDef.cssClassFriendlyName,
      this.elementRef.nativeElement!,
      sizeToApply,
      previousSize,
    );
  }

  private _applyMinWidthPx(): void {
    this.resizeStrategy.applyMinColumnSize(
      this.columnDef.cssClassFriendlyName,
      this.elementRef.nativeElement,
      this.minWidthPx,
    );
  }

  private _applyMaxWidthPx(): void {
    this.resizeStrategy.applyMaxColumnSize(
      this.columnDef.cssClassFriendlyName,
      this.elementRef.nativeElement,
      this.maxWidthPx,
    );
  }

  private _appendInlineHandle(): void {
    this.styleScheduler.schedule(() => {
      this.inlineHandle = this.document.createElement('div');
      this.inlineHandle.tabIndex = 0;
      this.inlineHandle.className = this.getInlineHandleCssClassName();

      // TODO: Apply correct aria role (probably slider) after a11y spec questions resolved.

      this.elementRef.nativeElement!.appendChild(this.inlineHandle);
    });
  }
}

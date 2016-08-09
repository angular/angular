import {
    NgModule,
    Component,
    ComponentRef,
    Directive,
    Input,
    ElementRef,
    ViewContainerRef,
    ChangeDetectorRef
} from '@angular/core';
import {
  Overlay,
  OverlayState,
  OverlayModule,
  OverlayRef,
  ComponentPortal,
  OverlayConnectionPosition,
  OriginConnectionPosition,
} from '@angular2-material/core/core';

export type TooltipPosition = 'before' | 'after' | 'above' | 'below';

@Directive({
  selector: '[md-tooltip]',
  host: {
    '(mouseenter)': '_handleMouseEnter($event)',
    '(mouseleave)': '_handleMouseLeave($event)',
  }
})
export class MdTooltip {
  visible: boolean = false;

  /** Allows the user to define the position of the tooltip relative to the parent element */
  private _position: TooltipPosition = 'below';
  @Input('tooltip-position') get position(): TooltipPosition {
    return this._position;
  }
  set position(value: TooltipPosition) {
    if (value !== this._position) {
      this._position = value;
      this._createOverlay();
      this._updatePosition();
    }
  }

  /** The message to be displayed in the tooltip */
  private _message: string;
  @Input('md-tooltip') get message() {
    return this._message;
  }
  set message(value: string) {
    this._message = value;
    this._updatePosition();
  }

  private _overlayRef: OverlayRef;

  constructor(private _overlay: Overlay, private _elementRef: ElementRef,
      private _viewContainerRef: ViewContainerRef,
      private _changeDetectionRef: ChangeDetectorRef) {}

  /** 
   * Create overlay on init
   * TODO: @internal
   */
  ngOnInit() {
    this._createOverlay();
  }

  /**
   * Create the overlay config and position strategy
   */
  private _createOverlay() {
    if (this._overlayRef) {
      if (this.visible) {
        // if visible, hide before destroying
        this.hide().then(() => this._createOverlay());
      } else {
        // if not visible, dispose and recreate
        this._overlayRef.dispose();
        this._overlayRef = null;
        this._createOverlay();
      }
    } else {
      let origin = this._getOrigin();
      let position = this._getOverlayPosition();
      let strategy = this._overlay.position().connectedTo(this._elementRef, origin, position);
      let config = new OverlayState();
      config.positionStrategy = strategy;
      this._overlay.create(config).then(ref => {
        this._overlayRef = ref;
      });
    }
  }

  /**
   * Returns the origin position based on the user's position preference
   */
  private _getOrigin(): OriginConnectionPosition {
    switch (this.position) {
      case 'before': return { originX: 'start', originY: 'center' };
      case 'after':  return { originX: 'end', originY: 'center' };
      case 'above':  return { originX: 'center', originY: 'top' };
      case 'below':  return { originX: 'center', originY: 'bottom' };
    }
  }

  /**
   * Returns the overlay position based on the user's preference
   */
  private _getOverlayPosition(): OverlayConnectionPosition {
    switch (this.position) {
      case 'before': return { overlayX: 'end', overlayY: 'center' };
      case 'after':  return { overlayX: 'start', overlayY: 'center' };
      case 'above':  return { overlayX: 'center', overlayY: 'bottom' };
      case 'below':  return { overlayX: 'center', overlayY: 'top' };
    }
  }

  /**
   * Shows the tooltip on mouse enter
   * @param event
   */
  _handleMouseEnter(event: MouseEvent) {
    this.show();
  }

  /**
   * Hides the tooltip on mouse leave
   * @param event
   */
  _handleMouseLeave(event: MouseEvent) {
    this.hide();
  }

  /**
   * Shows the tooltip and returns a promise that will resolve when the tooltip is visible
   */
  show(): Promise<any> {
    if (!this.visible && this._overlayRef && !this._overlayRef.hasAttached()) {
      this.visible = true;
      let promise = this._overlayRef.attach(new ComponentPortal(TooltipComponent,
          this._viewContainerRef));
      promise.then((ref: ComponentRef<TooltipComponent>) => {
        ref.instance.message = this.message;
        this._updatePosition();
      });
      return promise;
    }
  }

  /**
   * Hides the tooltip and returns a promise that will resolve when the tooltip is hidden
   */
  hide(): Promise<any> {
    if (this.visible && this._overlayRef && this._overlayRef.hasAttached()) {
      this.visible = false;
      return this._overlayRef.detach();
    }
  }

  /**
   * Shows/hides the tooltip and returns a promise that will resolve when it is done
   */
  toggle(): Promise<any> {
    if (this.visible) {
      return this.hide();
    } else {
      return this.show();
    }
  }

  /**
   * Updates the tooltip's position
   */
  private _updatePosition() {
    if (this._overlayRef) {
      this._changeDetectionRef.detectChanges();
      this._overlayRef.updatePosition();
    }
  }
}

@Component({
  moduleId: module.id,
  selector: 'md-tooltip-component',
  template: `<div class="md-tooltip">{{message}}</div>`,
  styleUrls: ['tooltip.css'],
})
export class TooltipComponent {
  message: string;
}

/** @deprecated */
export const MD_TOOLTIP_DIRECTIVES = [MdTooltip];


@NgModule({
  imports: [OverlayModule],
  exports: [MD_TOOLTIP_DIRECTIVES, TooltipComponent],
  declarations: [MD_TOOLTIP_DIRECTIVES, TooltipComponent],
  entryComponents: [TooltipComponent],
})
export class MdTooltipModule { }

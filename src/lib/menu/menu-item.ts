import {Directive, ElementRef, Input, HostBinding, Renderer} from '@angular/core';

/**
 * This directive is intended to be used inside an md-menu tag.
 * It exists mostly to set the role attribute.
 */
@Directive({
  selector: '[md-menu-item]',
  host: {
    'role': 'menuitem',
    '(click)': '_checkDisabled($event)',
    'tabindex': '-1'
  },
  exportAs: 'mdMenuItem'
})
export class MdMenuItem {
  _disabled: boolean;

  constructor(private _renderer: Renderer, private _elementRef: ElementRef) {}

  focus(): void {
    this._renderer.invokeElementMethod(this._elementRef.nativeElement, 'focus');
  }

  // this is necessary to support anchors
  @HostBinding('attr.disabled')
  @Input()
  get disabled(): boolean {
    return this._disabled;
  }

  set disabled(value: boolean) {
    this._disabled = (value === false || value === undefined) ? null : true;
  }

  @HostBinding('attr.aria-disabled')
  get isAriaDisabled(): string {
    return String(this.disabled);
  }

  /**
   * TODO: internal
   */
  _checkDisabled(event: Event) {
    if (this.disabled) {
      event.preventDefault();
      event.stopPropagation();
    }
  }
}


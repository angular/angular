import {Component, ElementRef, Input, HostBinding, Renderer} from '@angular/core';
import {MdFocusable} from '../core/a11y/list-key-manager';

/**
 * This directive is intended to be used inside an md-menu tag.
 * It exists mostly to set the role attribute.
 */
@Component({
  moduleId: module.id,
  selector: '[md-menu-item], [mat-menu-item]',
  host: {
    'role': 'menuitem',
    '(click)': '_checkDisabled($event)',
    '[attr.tabindex]': '_tabindex'
  },
  templateUrl: 'menu-item.html',
  exportAs: 'mdMenuItem'
})
export class MdMenuItem implements MdFocusable {
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
    return String(!!this.disabled);
  }

  get _tabindex() {
    return this.disabled ? '-1' : '0';
  }


  _getHostElement(): HTMLElement {
    return this._elementRef.nativeElement;
  }

  _checkDisabled(event: Event) {
    if (this.disabled) {
      event.preventDefault();
      event.stopPropagation();
    }
  }
}


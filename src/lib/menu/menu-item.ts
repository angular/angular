import {Component, ElementRef, Input, Renderer} from '@angular/core';
import {Focusable} from '../core/a11y/focus-key-manager';
import {coerceBooleanProperty} from '../core/coercion/boolean-property';

/**
 * This directive is intended to be used inside an md-menu tag.
 * It exists mostly to set the role attribute.
 */
@Component({
  moduleId: module.id,
  selector: '[md-menu-item], [mat-menu-item]',
  host: {
    'role': 'menuitem',
    '[class.mat-menu-item]': 'true',
    '[attr.tabindex]': '_getTabIndex()',
    '[attr.aria-disabled]': 'disabled.toString()',
    '[attr.disabled]': '_getDisabledAttr()',
    '(click)': '_checkDisabled($event)',
  },
  templateUrl: 'menu-item.html',
  exportAs: 'mdMenuItem'
})
export class MdMenuItem implements Focusable {
  /** Whether the menu item is disabled */
  private _disabled: boolean = false;

  constructor(private _renderer: Renderer, private _elementRef: ElementRef) {}

  /** Focuses the menu item. */
  focus(): void {
    this._renderer.invokeElementMethod(this._getHostElement(), 'focus');
  }

  /** Whether the menu item is disabled. */
  @Input()
  get disabled() { return this._disabled; }
  set disabled(value: any) {
    this._disabled = coerceBooleanProperty(value);
  }

  /** Used to set the `tabindex`. */
  _getTabIndex(): string {
    return this._disabled ? '-1' : '0';
  }

  /** Used to set the HTML `disabled` attribute. Necessary for links to be disabled properly. */
  _getDisabledAttr(): boolean {
    return this._disabled ? true : null;
  }

  /** Returns the host DOM element. */
  _getHostElement(): HTMLElement {
    return this._elementRef.nativeElement;
  }

  /** Prevents the default element actions if it is disabled. */
  _checkDisabled(event: Event): void {
    if (this.disabled) {
      event.preventDefault();
      event.stopPropagation();
    }
  }
}


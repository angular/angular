import {
  Component,
  ViewEncapsulation,
  ContentChildren,
  ContentChild,
  QueryList,
  Directive,
  ElementRef,
  Input,
  Optional,
  Renderer2,
  AfterContentInit,
} from '@angular/core';
import {MdLine, MdLineSetter, coerceBooleanProperty} from '../core';

@Directive({
  selector: 'md-divider, mat-divider'
})
export class MdListDivider {}

@Component({
  moduleId: module.id,
  selector: 'md-list, mat-list, md-nav-list, mat-nav-list',
  host: {
    'role': 'list'},
  template: '<ng-content></ng-content>',
  styleUrls: ['list.css'],
  encapsulation: ViewEncapsulation.None
})
export class MdList {
  private _disableRipple: boolean = false;

  /**
   * Whether the ripple effect should be disabled on the list-items or not.
   * This flag only has an effect for `md-nav-list` components.
   */
  @Input()
  get disableRipple() { return this._disableRipple; }
  set disableRipple(value: boolean) { this._disableRipple = coerceBooleanProperty(value); }
}

/**
 * Directive whose purpose is to add the mat- CSS styling to this selector.
 * @docs-private
 */
@Directive({
  selector: 'md-list, mat-list',
  host: {
    '[class.mat-list]': 'true'
  }
})
export class MdListCssMatStyler {}

/**
 * Directive whose purpose is to add the mat- CSS styling to this selector.
 * @docs-private
 */
@Directive({
  selector: 'md-nav-list, mat-nav-list',
  host: {
    '[class.mat-nav-list]': 'true'
  }
})
export class MdNavListCssMatStyler {}

/**
 * Directive whose purpose is to add the mat- CSS styling to this selector.
 * @docs-private
 */
@Directive({
  selector: 'md-divider, mat-divider',
  host: {
    '[class.mat-divider]': 'true'
  }
})
export class MdDividerCssMatStyler {}

/**
 * Directive whose purpose is to add the mat- CSS styling to this selector.
 * @docs-private
 */
@Directive({
  selector: '[md-list-avatar], [mat-list-avatar]',
  host: {
    '[class.mat-list-avatar]': 'true'
  }
})
export class MdListAvatarCssMatStyler {}

/**
 * Directive whose purpose is to add the mat- CSS styling to this selector.
 * @docs-private
 */
@Directive({
  selector: '[md-list-icon], [mat-list-icon]',
  host: {
    '[class.mat-list-icon]': 'true'
  }
})
export class MdListIconCssMatStyler {}

/**
 * Directive whose purpose is to add the mat- CSS styling to this selector.
 * @docs-private
 */
@Directive({
  selector: '[md-subheader], [mat-subheader]',
  host: {
    '[class.mat-subheader]': 'true'
  }
})
export class MdListSubheaderCssMatStyler {}

@Component({
  moduleId: module.id,
  selector: 'md-list-item, mat-list-item, a[md-list-item], a[mat-list-item]',
  host: {
    'role': 'listitem',
    '(focus)': '_handleFocus()',
    '(blur)': '_handleBlur()',
    '[class.mat-list-item]': 'true',
  },
  templateUrl: 'list-item.html',
  encapsulation: ViewEncapsulation.None
})
export class MdListItem implements AfterContentInit {
  private _lineSetter: MdLineSetter;
  private _disableRipple: boolean = false;
  private _isNavList: boolean = false;

  _hasFocus: boolean = false;

  /**
   * Whether the ripple effect on click should be disabled. This applies only to list items that are
   * part of a nav list. The value of `disableRipple` on the `md-nav-list` overrides this flag.
   */
  @Input()
  get disableRipple() { return this._disableRipple; }
  set disableRipple(value: boolean) { this._disableRipple = coerceBooleanProperty(value); }

  @ContentChildren(MdLine) _lines: QueryList<MdLine>;

  @ContentChild(MdListAvatarCssMatStyler)
  set _hasAvatar(avatar: MdListAvatarCssMatStyler) {
    if (avatar != null) {
      this._renderer.addClass(this._element.nativeElement, 'mat-list-item-avatar');
    } else {
      this._renderer.removeClass(this._element.nativeElement, 'mat-list-item-avatar');
    }
  }

  constructor(private _renderer: Renderer2,
              private _element: ElementRef,
              @Optional() private _list: MdList,
              @Optional() navList: MdNavListCssMatStyler) {
    this._isNavList = !!navList;
  }

  ngAfterContentInit() {
    this._lineSetter = new MdLineSetter(this._lines, this._renderer, this._element);
  }

  /** Whether this list item should show a ripple effect when clicked.  */
  isRippleEnabled() {
    return !this.disableRipple && this._isNavList && !this._list.disableRipple;
  }

  _handleFocus() {
    this._hasFocus = true;
  }

  _handleBlur() {
    this._hasFocus = false;
  }

  /** Retrieves the DOM element of the component host. */
  _getHostElement(): HTMLElement {
    return this._element.nativeElement;
  }
}

import {
  Component,
  ViewEncapsulation,
  ContentChildren,
  ContentChild,
  QueryList,
  Directive,
  ElementRef,
  Inject,
  Input,
  OpaqueToken,
  Optional,
  Renderer,
  AfterContentInit,
} from '@angular/core';
import {MdLine, MdLineSetter} from '../core';

@Directive({
  selector: 'md-divider, mat-divider'
})
export class MdListDivider {}

/**
 * Token used to inject the list type into child MdListItem components so they can know whether
 * they're in a nav list (and thus should use an MdRipple).
 */
export const LIST_TYPE_TOKEN = new OpaqueToken('list_type');

const NORMAL_LIST_TYPE = 'normal_list_type';
const NAV_LIST_TYPE = 'nav_list_type';

@Component({
  moduleId: module.id,
  selector: 'md-list, mat-list, md-nav-list, mat-nav-list',
  host: {
    'role': 'list'},
  template: '<ng-content></ng-content>',
  styleUrls: ['list.css'],
  providers: [{ provide: LIST_TYPE_TOKEN, useValue: NORMAL_LIST_TYPE }],
  encapsulation: ViewEncapsulation.None
})
export class MdList {}

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
 * Directive to set the ListType token to NAV_LIST_TYPE.
 */
@Directive({
  selector: 'md-nav-list, mat-nav-list',
  providers: [{ provide: LIST_TYPE_TOKEN, useValue: NAV_LIST_TYPE }],
})
export class MdNavListTokenSetter {}

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
  /**
   * Whether the ripple effect on click should be disabled. This applies only to list items that
   * are children of an md-nav-list; md-list items never have ripples.
   */
  @Input() disableRipple: boolean = false;
  _hasFocus: boolean = false;

  private _lineSetter: MdLineSetter;

  @ContentChildren(MdLine) _lines: QueryList<MdLine>;

  @ContentChild(MdListAvatarCssMatStyler)
  set _hasAvatar(avatar: MdListAvatarCssMatStyler) {
    this._renderer.setElementClass(
        this._element.nativeElement, 'mat-list-item-avatar', avatar != null);
  }

  constructor(private _renderer: Renderer, private _element: ElementRef,
      @Optional() @Inject(LIST_TYPE_TOKEN) private _listType: string) {}

  ngAfterContentInit() {
    this._lineSetter = new MdLineSetter(this._lines, this._renderer, this._element);
  }

  /** Whether this list item should show a ripple effect when clicked.  */
  isRippleEnabled() {
    return !this.disableRipple && (this._listType === NAV_LIST_TYPE);
  }

  _handleFocus() {
    this._hasFocus = true;
  }

  _handleBlur() {
    this._hasFocus = false;
  }
}

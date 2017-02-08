import {
    Component,
    ViewEncapsulation,
    ContentChildren,
    ContentChild,
    QueryList,
    Directive,
    ElementRef,
    Renderer,
    AfterContentInit,
    NgModule,
    ModuleWithProviders,
} from '@angular/core';
import {MdLine, MdLineSetter, MdLineModule, CompatibilityModule} from '../core';

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
export class MdList {}

/**
 * Directive whose purpose is to add the mat- CSS styling to this selector.
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
 */
@Directive({
  selector: 'md-divider, mat-divider',
  host: {
    '[class.mat-divider]': 'true'
  }
})
export class MdDividerCssMatStyler {}

/* Need directive for a ContentChild query in list-item */
@Directive({
  selector: '[md-list-avatar], [mat-list-avatar]',
  host: {
    '[class.mat-list-avatar]': 'true'
  }
})
export class MdListAvatarCssMatStyler {}

/* Need directive to add mat- CSS styling */
@Directive({
  selector: '[md-list-icon], [mat-list-icon]',
  host: {
    '[class.mat-list-icon]': 'true'
  }
})
export class MdListIconCssMatStyler {}

/**
 * Directive whose purpose is to add the mat- CSS styling to this selector.
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
  _hasFocus: boolean = false;

  private _lineSetter: MdLineSetter;

  @ContentChildren(MdLine) _lines: QueryList<MdLine>;

  @ContentChild(MdListAvatarCssMatStyler)
  set _hasAvatar(avatar: MdListAvatarCssMatStyler) {
    this._renderer.setElementClass(
        this._element.nativeElement, 'mat-list-item-avatar', avatar != null);
  }

  constructor(private _renderer: Renderer, private _element: ElementRef) {}

  ngAfterContentInit() {
    this._lineSetter = new MdLineSetter(this._lines, this._renderer, this._element);
  }

  _handleFocus() {
    this._hasFocus = true;
  }

  _handleBlur() {
    this._hasFocus = false;
  }
}


@NgModule({
  imports: [MdLineModule, CompatibilityModule],
  exports: [
    MdList,
    MdListItem,
    MdListDivider,
    MdListAvatarCssMatStyler,
    MdLineModule,
    CompatibilityModule,
    MdListIconCssMatStyler,
    MdListCssMatStyler,
    MdNavListCssMatStyler,
    MdDividerCssMatStyler,
    MdListSubheaderCssMatStyler
  ],
  declarations: [
    MdList,
    MdListItem,
    MdListDivider,
    MdListAvatarCssMatStyler,
    MdListIconCssMatStyler,
    MdListCssMatStyler,
    MdNavListCssMatStyler,
    MdDividerCssMatStyler,
    MdListSubheaderCssMatStyler
  ],
})
export class MdListModule {
  /** @deprecated */
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MdListModule,
      providers: []
    };
  }
}

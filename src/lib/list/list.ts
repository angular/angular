/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  ContentChildren,
  Directive,
  ElementRef,
  Optional,
  QueryList,
  ViewEncapsulation,
} from '@angular/core';
import {CanDisableRipple, MatLine, MatLineSetter, mixinDisableRipple} from '@angular/material/core';

// Boilerplate for applying mixins to MatList.
/** @docs-private */
export class MatListBase {}
export const _MatListMixinBase = mixinDisableRipple(MatListBase);

// Boilerplate for applying mixins to MatListItem.
/** @docs-private */
export class MatListItemBase {}
export const _MatListItemMixinBase = mixinDisableRipple(MatListItemBase);

@Component({
  moduleId: module.id,
  selector: 'mat-nav-list',
  exportAs: 'matNavList',
  host: {
    'role': 'navigation',
    'class': 'mat-nav-list'
  },
  templateUrl: 'list.html',
  styleUrls: ['list.css'],
  inputs: ['disableRipple'],
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatNavList extends _MatListMixinBase implements CanDisableRipple {}

@Component({
  moduleId: module.id,
  selector: 'mat-list',
  exportAs: 'matList',
  templateUrl: 'list.html',
  host: {'class': 'mat-list'},
  styleUrls: ['list.css'],
  inputs: ['disableRipple'],
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatList extends _MatListMixinBase implements CanDisableRipple {}

/**
 * Directive whose purpose is to add the mat- CSS styling to this selector.
 * @docs-private
 */
@Directive({
  selector: '[mat-list-avatar], [matListAvatar]',
  host: {'class': 'mat-list-avatar'}
})
export class MatListAvatarCssMatStyler {}

/**
 * Directive whose purpose is to add the mat- CSS styling to this selector.
 * @docs-private
 */
@Directive({
  selector: '[mat-list-icon], [matListIcon]',
  host: {'class': 'mat-list-icon'}
})
export class MatListIconCssMatStyler {}

/**
 * Directive whose purpose is to add the mat- CSS styling to this selector.
 * @docs-private
 */
@Directive({
  selector: '[mat-subheader], [matSubheader]',
  host: {'class': 'mat-subheader'}
})
export class MatListSubheaderCssMatStyler {}

/** An item within a Material Design list. */
@Component({
  moduleId: module.id,
  selector: 'mat-list-item, a[mat-list-item]',
  exportAs: 'matListItem',
  host: {
    'class': 'mat-list-item',
    '(focus)': '_handleFocus()',
    '(blur)': '_handleBlur()',
  },
  inputs: ['disableRipple'],
  templateUrl: 'list-item.html',
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatListItem extends _MatListItemMixinBase implements AfterContentInit,
    CanDisableRipple {
  private _lineSetter: MatLineSetter;
  private _isNavList: boolean = false;

  @ContentChildren(MatLine) _lines: QueryList<MatLine>;

  @ContentChild(MatListAvatarCssMatStyler)
  set _hasAvatar(avatar: MatListAvatarCssMatStyler) {
    if (avatar != null) {
      this._element.nativeElement.classList.add('mat-list-item-avatar');
    } else {
      this._element.nativeElement.classList.remove('mat-list-item-avatar');
    }
  }

  constructor(private _element: ElementRef,
              @Optional() private _navList: MatNavList) {
    super();
    this._isNavList = !!_navList;
  }

  ngAfterContentInit() {
    this._lineSetter = new MatLineSetter(this._lines, this._element);
  }

  /** Whether this list item should show a ripple effect when clicked.  */
  _isRippleDisabled() {
    return !this._isNavList || this.disableRipple || this._navList.disableRipple;
  }

  _handleFocus() {
    this._element.nativeElement.classList.add('mat-list-item-focus');
  }

  _handleBlur() {
    this._element.nativeElement.classList.remove('mat-list-item-focus');
  }

  /** Retrieves the DOM element of the component host. */
  _getHostElement(): HTMLElement {
    return this._element.nativeElement;
  }
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {coerceBooleanProperty, BooleanInput} from '@angular/cdk/coercion';
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
  OnChanges,
  OnDestroy,
  ChangeDetectorRef,
  Input,
  InjectionToken,
  Inject,
} from '@angular/core';
import {
  CanDisable,
  CanDisableRipple,
  MatLine,
  setLines,
  mixinDisableRipple,
  mixinDisabled,
} from '@angular/material/core';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

// Boilerplate for applying mixins to MatList.
/** @docs-private */
const _MatListBase = mixinDisabled(mixinDisableRipple(class {}));

// Boilerplate for applying mixins to MatListItem.
/** @docs-private */
const _MatListItemMixinBase = mixinDisableRipple(class {});

/**
 * Injection token that can be used to inject instances of `MatList`. It serves as
 * alternative token to the actual `MatList` class which could cause unnecessary
 * retention of the class and its component metadata.
 */
export const MAT_LIST = new InjectionToken<MatList>('MatList');

/**
 * Injection token that can be used to inject instances of `MatNavList`. It serves as
 * alternative token to the actual `MatNavList` class which could cause unnecessary
 * retention of the class and its component metadata.
 */
export const MAT_NAV_LIST = new InjectionToken<MatNavList>('MatNavList');

@Component({
  selector: 'mat-nav-list',
  exportAs: 'matNavList',
  host: {
    'role': 'navigation',
    'class': 'mat-nav-list mat-list-base',
  },
  templateUrl: 'list.html',
  styleUrls: ['list.css'],
  inputs: ['disableRipple', 'disabled'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{provide: MAT_NAV_LIST, useExisting: MatNavList}],
})
export class MatNavList
  extends _MatListBase
  implements CanDisable, CanDisableRipple, OnChanges, OnDestroy
{
  /** Emits when the state of the list changes. */
  readonly _stateChanges = new Subject<void>();

  ngOnChanges() {
    this._stateChanges.next();
  }

  ngOnDestroy() {
    this._stateChanges.complete();
  }
}

@Component({
  selector: 'mat-list, mat-action-list',
  exportAs: 'matList',
  templateUrl: 'list.html',
  host: {
    'class': 'mat-list mat-list-base',
  },
  styleUrls: ['list.css'],
  inputs: ['disableRipple', 'disabled'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{provide: MAT_LIST, useExisting: MatList}],
})
export class MatList
  extends _MatListBase
  implements CanDisable, CanDisableRipple, OnChanges, OnDestroy
{
  /** Emits when the state of the list changes. */
  readonly _stateChanges = new Subject<void>();

  constructor(private _elementRef: ElementRef<HTMLElement>) {
    super();

    if (this._getListType() === 'action-list') {
      _elementRef.nativeElement.classList.add('mat-action-list');
      _elementRef.nativeElement.setAttribute('role', 'group');
    }
  }

  _getListType(): 'list' | 'action-list' | null {
    const nodeName = this._elementRef.nativeElement.nodeName.toLowerCase();

    if (nodeName === 'mat-list') {
      return 'list';
    }

    if (nodeName === 'mat-action-list') {
      return 'action-list';
    }

    return null;
  }

  ngOnChanges() {
    this._stateChanges.next();
  }

  ngOnDestroy() {
    this._stateChanges.complete();
  }
}

/**
 * Directive whose purpose is to add the mat- CSS styling to this selector.
 * @docs-private
 */
@Directive({
  selector: '[mat-list-avatar], [matListAvatar]',
  host: {'class': 'mat-list-avatar'},
})
export class MatListAvatarCssMatStyler {}

/**
 * Directive whose purpose is to add the mat- CSS styling to this selector.
 * @docs-private
 */
@Directive({
  selector: '[mat-list-icon], [matListIcon]',
  host: {'class': 'mat-list-icon'},
})
export class MatListIconCssMatStyler {}

/**
 * Directive whose purpose is to add the mat- CSS styling to this selector.
 * @docs-private
 */
@Directive({
  selector: '[mat-subheader], [matSubheader]',
  host: {'class': 'mat-subheader'},
})
export class MatListSubheaderCssMatStyler {}

/** An item within a Material Design list. */
@Component({
  selector: 'mat-list-item, a[mat-list-item], button[mat-list-item]',
  exportAs: 'matListItem',
  host: {
    'class': 'mat-list-item mat-focus-indicator',
    '[class.mat-list-item-disabled]': 'disabled',
    '[class.mat-list-item-with-avatar]': '_avatar || _icon',
  },
  inputs: ['disableRipple'],
  templateUrl: 'list-item.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatListItem
  extends _MatListItemMixinBase
  implements AfterContentInit, CanDisableRipple, OnDestroy
{
  private _isInteractiveList: boolean = false;
  private _list?: MatNavList | MatList;
  private readonly _destroyed = new Subject<void>();

  @ContentChildren(MatLine, {descendants: true}) _lines: QueryList<MatLine>;
  @ContentChild(MatListAvatarCssMatStyler) _avatar: MatListAvatarCssMatStyler;
  @ContentChild(MatListIconCssMatStyler) _icon: MatListIconCssMatStyler;

  constructor(
    private _element: ElementRef<HTMLElement>,
    _changeDetectorRef: ChangeDetectorRef,
    @Optional() @Inject(MAT_NAV_LIST) navList?: MatNavList,
    @Optional() @Inject(MAT_LIST) list?: MatList,
  ) {
    super();
    this._isInteractiveList = !!(navList || (list && list._getListType() === 'action-list'));
    this._list = navList || list;

    // If no type attribute is specified for <button>, set it to "button".
    // If a type attribute is already specified, do nothing.
    const element = this._getHostElement();

    if (element.nodeName.toLowerCase() === 'button' && !element.hasAttribute('type')) {
      element.setAttribute('type', 'button');
    }

    if (this._list) {
      // React to changes in the state of the parent list since
      // some of the item's properties depend on it (e.g. `disableRipple`).
      this._list._stateChanges.pipe(takeUntil(this._destroyed)).subscribe(() => {
        _changeDetectorRef.markForCheck();
      });
    }
  }

  /** Whether the option is disabled. */
  @Input()
  get disabled(): boolean {
    return this._disabled || !!(this._list && this._list.disabled);
  }
  set disabled(value: BooleanInput) {
    this._disabled = coerceBooleanProperty(value);
  }
  private _disabled = false;

  ngAfterContentInit() {
    setLines(this._lines, this._element);
  }

  ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();
  }

  /** Whether this list item should show a ripple effect when clicked. */
  _isRippleDisabled() {
    return (
      !this._isInteractiveList || this.disableRipple || !!(this._list && this._list.disableRipple)
    );
  }

  /** Retrieves the DOM element of the component host. */
  _getHostElement(): HTMLElement {
    return this._element.nativeElement;
  }
}

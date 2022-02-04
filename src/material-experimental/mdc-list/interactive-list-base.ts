/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DOCUMENT} from '@angular/common';
import {AfterViewInit, Directive, ElementRef, Inject, OnDestroy, QueryList} from '@angular/core';
import {MDCListAdapter, MDCListFoundation} from '@material/list';
import {Subscription} from 'rxjs';
import {startWith} from 'rxjs/operators';
import {MatListBase, MatListItemBase} from './list-base';

@Directive({
  host: {
    '(keydown)': '_handleKeydown($event)',
    '(click)': '_handleClick($event)',
    '(focusin)': '_handleFocusin($event)',
    '(focusout)': '_handleFocusout($event)',
  },
})
/** @docs-private */
export abstract class MatInteractiveListBase<T extends MatListItemBase>
  extends MatListBase
  implements AfterViewInit, OnDestroy
{
  _handleKeydown(event: KeyboardEvent) {
    const index = this._indexForElement(event.target as HTMLElement);
    this._foundation.handleKeydown(event, this._elementAtIndex(index) === event.target, index);
  }

  _handleClick(event: MouseEvent) {
    // The `isCheckboxAlreadyUpdatedInAdapter` parameter can always be `false` as it only has an
    // effect if the list is recognized as checkbox selection list. For such lists, we would
    // always want to toggle the checkbox on list item click. MDC added this parameter so that
    // they can avoid dispatching a fake `change` event when the checkbox is directly clicked
    // for the list item. We don't need this as we do not have an underlying native checkbox
    // that is reachable by users through interaction.
    // https://github.com/material-components/material-components-web/blob/08ca4d0ec5f359bc3a20bd2a302fa6b733b5e135/packages/mdc-list/component.ts#L308-L310
    this._foundation.handleClick(
      this._indexForElement(event.target as HTMLElement),
      /* isCheckboxAlreadyUpdatedInAdapter */ false,
      event,
    );
  }

  _handleFocusin(event: FocusEvent) {
    const itemIndex = this._indexForElement(event.target as HTMLElement);
    const tabIndex = this._itemsArr[itemIndex]?._hostElement.tabIndex;

    // If the newly focused item is not the designated item that should have received focus
    // first through keyboard interaction, the tabindex of the previously designated list item
    // needs to be cleared, so that only one list item is reachable through tab key at any time.
    // MDC sets a tabindex for the newly focused item, so we do not need to set a tabindex for it.
    // Workaround for: https://github.com/material-components/material-components-web/issues/6363.
    if (tabIndex === undefined || tabIndex === -1) {
      this._clearTabindexForAllItems();
    }

    this._foundation.handleFocusIn(itemIndex);
  }

  _handleFocusout(event: FocusEvent) {
    this._foundation.handleFocusOut(this._indexForElement(event.target as HTMLElement));
  }

  /** Items in the interactive list. */
  abstract _items: QueryList<T>;
  _itemsArr: T[] = [];
  _document: Document;

  protected _foundation: MDCListFoundation;
  protected _adapter: MDCListAdapter;

  private _subscriptions = new Subscription();

  protected constructor(public _element: ElementRef<HTMLElement>, @Inject(DOCUMENT) document: any) {
    super();
    this._document = document;
    this._isNonInteractive = false;
  }

  protected _initWithAdapter(adapter: MDCListAdapter) {
    this._adapter = adapter;
    this._foundation = new MDCListFoundation(adapter);
  }

  ngAfterViewInit() {
    if ((typeof ngDevMode === 'undefined' || ngDevMode) && !this._foundation) {
      throw Error('MDC list foundation not initialized for Angular Material list.');
    }

    this._foundation.init();
    this._watchListItems();

    // Enable typeahead and focus wrapping for interactive lists.
    this._foundation.setHasTypeahead(true);
    this._foundation.setWrapFocus(true);
  }

  ngOnDestroy() {
    this._foundation.destroy();
    this._subscriptions.unsubscribe();
  }

  protected _watchListItems() {
    this._subscriptions.add(
      this._items.changes.pipe(startWith(null)).subscribe(() => {
        this._itemsArr = this._items.toArray();
        // Whenever the items change, the foundation needs to be notified through the `layout`
        // method. It caches items for the typeahead and detects the list type based on the items.
        this._foundation.layout();

        // The list items changed, so we reset the tabindex for all items and
        // designate one list item that will be reachable through tab.
        this._resetTabindexToFirstSelectedOrFocusedItem();
      }),
    );
  }

  /**
   * Clears the tabindex of all items so that no items are reachable through tab key.
   * MDC intends to always have only one tabbable item that will receive focus first.
   * This first item is selected by MDC automatically on blur or by manually invoking
   * the `setTabindexToFirstSelectedOrFocusedItem` method.
   */
  private _clearTabindexForAllItems() {
    for (let items of this._itemsArr) {
      items._hostElement.setAttribute('tabindex', '-1');
    }
  }

  /**
   * Resets tabindex for all options and sets tabindex for the first selected option or
   * previously focused item so that an item can be reached when users tab into the list.
   */
  protected _resetTabindexToFirstSelectedOrFocusedItem() {
    this._clearTabindexForAllItems();
    // MDC does not expose the method for setting the tabindex to the first selected
    // or previously focused item. We can still access the method as private class
    // members are accessible in the transpiled JavaScript. Tracked upstream with:
    // TODO: https://github.com/material-components/material-components-web/issues/6375
    (this._foundation as any).setTabindexToFirstSelectedOrFocusedItem();
  }

  _elementAtIndex(index: number): HTMLElement | undefined {
    return this._itemsArr[index]?._hostElement;
  }

  _indexForElement(element: Element | null): number {
    return element ? this._itemsArr.findIndex(i => i._hostElement.contains(element)) : -1;
  }
}

// TODO: replace with class once material-components-web/pull/6256 is available.
/** Gets an instance of `MDcListAdapter` for the given interactive list. */
export function getInteractiveListAdapter(
  list: MatInteractiveListBase<MatListItemBase>,
): MDCListAdapter {
  return {
    getListItemCount() {
      return list._items.length;
    },
    listItemAtIndexHasClass(index: number, className: string) {
      const element = list._elementAtIndex(index);
      return element ? element.classList.contains(className) : false;
    },
    addClassForElementIndex(index: number, className: string) {
      list._elementAtIndex(index)?.classList.add(className);
    },
    removeClassForElementIndex(index: number, className: string) {
      list._elementAtIndex(index)?.classList.remove(className);
    },
    getAttributeForElementIndex(index: number, attr: string) {
      const element = list._elementAtIndex(index);
      return element ? element.getAttribute(attr) : null;
    },
    setAttributeForElementIndex(index: number, attr: string, value: string) {
      list._elementAtIndex(index)?.setAttribute(attr, value);
    },
    getFocusedElementIndex() {
      return list._indexForElement(list._document?.activeElement);
    },
    isFocusInsideList() {
      return list._element.nativeElement.contains(list._document?.activeElement);
    },
    isRootFocused() {
      return list._element.nativeElement === list._document?.activeElement;
    },
    focusItemAtIndex(index: number) {
      list._elementAtIndex(index)?.focus();
    },
    // Gets the text for a list item for the typeahead
    getPrimaryTextAtIndex(index: number) {
      return list._itemsArr[index]._getItemLabel();
    },

    // MDC uses this method to disable focusable children of list items. However, we believe that
    // this is not an accessible pattern and should be avoided, therefore we intentionally do not
    // implement this method. In addition, implementing this would require violating Angular
    // Material's general principle of not having components modify DOM elements they do not own.
    // A user who feels they really need this feature can simply listen to the `(focus)` and
    // `(blur)` events on the list item and enable/disable focus on the children themselves as
    // appropriate.
    setTabIndexForListItemChildren() {},

    // The following methods have a dummy implementation in the base class because they are only
    // applicable to certain types of lists. They should be implemented for the concrete classes
    // where they are applicable.
    hasCheckboxAtIndex() {
      return false;
    },
    hasRadioAtIndex(index: number) {
      return false;
    },
    setCheckedCheckboxOrRadioAtIndex(index: number, checked: boolean) {},
    isCheckboxCheckedAtIndex(index: number) {
      return false;
    },
    notifySelectionChange() {},
    notifyAction() {},
  };
}

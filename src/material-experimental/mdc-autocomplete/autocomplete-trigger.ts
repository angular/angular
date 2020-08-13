/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, forwardRef} from '@angular/core';
import {NG_VALUE_ACCESSOR} from '@angular/forms';
import {_MatAutocompleteTriggerBase} from '@angular/material/autocomplete';
import {_countGroupLabelsBeforeOption, _getOptionScrollPosition} from '@angular/material/core';

/**
 * Provider that allows the autocomplete to register as a ControlValueAccessor.
 * @docs-private
 */
export const MAT_AUTOCOMPLETE_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => MatAutocompleteTrigger),
  multi: true
};

@Directive({
  selector: `input[matAutocomplete], textarea[matAutocomplete]`,
  host: {
    'class': 'mat-autocomplete-trigger',
    '[attr.autocomplete]': 'autocompleteAttribute',
    '[attr.role]': 'autocompleteDisabled ? null : "combobox"',
    '[attr.aria-autocomplete]': 'autocompleteDisabled ? null : "list"',
    '[attr.aria-activedescendant]': '(panelOpen && activeOption) ? activeOption.id : null',
    '[attr.aria-expanded]': 'autocompleteDisabled ? null : panelOpen.toString()',
    '[attr.aria-owns]': '(autocompleteDisabled || !panelOpen) ? null : autocomplete?.id',
    '[attr.aria-haspopup]': '!autocompleteDisabled',
    // Note: we use `focusin`, as opposed to `focus`, in order to open the panel
    // a little earlier. This avoids issues where IE delays the focusing of the input.
    '(focusin)': '_handleFocus()',
    '(blur)': '_onTouched()',
    '(input)': '_handleInput($event)',
    '(keydown)': '_handleKeydown($event)',
  },
  exportAs: 'matAutocompleteTrigger',
  providers: [MAT_AUTOCOMPLETE_VALUE_ACCESSOR]
})
export class MatAutocompleteTrigger extends _MatAutocompleteTriggerBase {
  protected _aboveClass = 'mat-mdc-autocomplete-panel-above';

  protected _scrollToOption(index: number): void {
    // Given that we are not actually focusing active options, we must manually adjust scroll
    // to reveal options below the fold. First, we find the offset of the option from the top
    // of the panel. If that offset is below the fold, the new scrollTop will be the offset -
    // the panel height + the option height, so the active option will be just visible at the
    // bottom of the panel. If that offset is above the top of the visible panel, the new scrollTop
    // will become the offset. If that offset is visible within the panel already, the scrollTop is
    // not adjusted.
    const autocomplete = this.autocomplete;
    const labelCount = _countGroupLabelsBeforeOption(index,
      autocomplete.options, autocomplete.optionGroups);

    if (index === 0 && labelCount === 1) {
      // If we've got one group label before the option and we're at the top option,
      // scroll the list to the top. This is better UX than scrolling the list to the
      // top of the option, because it allows the user to read the top group's label.
      autocomplete._setScrollTop(0);
    } else {
      const option = autocomplete.options.toArray()[index];

      if (option) {
        const element = option._getHostElement();
        const newScrollPosition = _getOptionScrollPosition(
          element.offsetTop,
          element.offsetHeight,
          autocomplete._getScrollTop(),
          autocomplete.panel.nativeElement.offsetHeight
        );

        autocomplete._setScrollTop(newScrollPosition);
      }
    }
  }
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BooleanInput} from '@angular/cdk/coercion';
import {SelectionModel} from '@angular/cdk/collections';
import {Platform} from '@angular/cdk/platform';
import {
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  ElementRef,
  EventEmitter,
  forwardRef,
  Input,
  NgZone,
  Output,
  QueryList,
  ViewEncapsulation
} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {MatLine, ThemePalette} from '@angular/material/core';
import {MatListBase, MatListItemBase} from './list-base';

const MAT_SELECTION_LIST_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => MatSelectionList),
  multi: true
};

/** Change event that is being fired whenever the selected state of an option changes. */
export class MatSelectionListChange {
  constructor(
      /** Reference to the selection list that emitted the event. */
      public source: MatSelectionList,
      /** Reference to the option that has been changed. */
      public option: MatListOption) {}
}

@Component({
  selector: 'mat-selection-list',
  exportAs: 'matSelectionList',
  host: {
    'class': 'mat-mdc-selection-list mat-mdc-list-base mdc-list',
    'role': 'listbox',
  },
  template: '<ng-content></ng-content>',
  styleUrls: ['list.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    MAT_SELECTION_LIST_VALUE_ACCESSOR,
    {provide: MatListBase, useExisting: MatSelectionList}
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatSelectionList extends MatListBase implements ControlValueAccessor {
  // TODO: Implement these inputs.
  @Input() disableRipple: boolean;
  @Input() tabIndex: number;
  @Input() color: ThemePalette;
  @Input() compareWith: (o1: any, o2: any) => boolean;
  @Input() disabled: boolean;
  @Input() multiple: boolean;

  // TODO: Implement these inputs.
  @Output() readonly selectionChange = new EventEmitter<MatSelectionListChange>();

  @ContentChildren(forwardRef(() => MatListOption), {descendants: true}) options:
      QueryList<MatListOption>;

  // TODO: Implement these properties.
  selectedOptions: SelectionModel<MatListOption>;

  // TODO: Implement these methods.
  focus(options?: FocusOptions) {}
  selectAll() {}
  deselectAll() {}
  registerOnChange(fn: any) {}
  registerOnTouched(fn: any) {}
  writeValue(obj: any) {}
}

@Component({
  selector: 'mat-list-option',
  exportAs: 'matListOption',
  host: {
    'class': 'mat-mdc-list-item mat-mdc-list-option mdc-list-item',
    'role': 'option',
    'tabindex': '-1',
  },
  templateUrl: 'list-option.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {provide: MatListItemBase, useExisting: MatListOption},
  ]
})
export class MatListOption extends MatListItemBase {
  static ngAcceptInputType_disabled: BooleanInput;
  static ngAcceptInputType_selected: BooleanInput;
  static ngAcceptInputType_disableRipple: BooleanInput;

  @ContentChildren(MatLine, {read: ElementRef, descendants: true}) lines:
      QueryList<ElementRef<Element>>;

  // TODO: Implement these inputs.
  @Input() disableRipple: boolean;
  @Input() checkboxPosition: 'before' | 'after' = 'before';
  @Input() color: ThemePalette;
  @Input() value: any;
  @Input() disabled: boolean;
  @Input() selected: boolean;

  constructor(element: ElementRef, ngZone: NgZone, listBase: MatListBase, platform: Platform,
              public selectionList: MatSelectionList) {
    super(element, ngZone, listBase, platform);
  }

  // TODO: Implement these methods.
  getLabel() { return ''; }
  focus() {}
  toggle() {}
}

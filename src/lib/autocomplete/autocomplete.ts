/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  AfterContentInit,
  Component,
  ContentChildren,
  ElementRef,
  Input,
  QueryList,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  EventEmitter,
  Output,
} from '@angular/core';
import {MdOption, MdOptgroup} from '../core';
import {ActiveDescendantKeyManager} from '@angular/cdk/a11y';


/**
 * Autocomplete IDs need to be unique across components, so this counter exists outside of
 * the component definition.
 */
let _uniqueAutocompleteIdCounter = 0;

/** Event object that is emitted when an autocomplete option is selected */
export class MdAutocompleteSelectedEvent {
  constructor(public source: MdAutocomplete, public option: MdOption) { }
}


@Component({
  moduleId: module.id,
  selector: 'md-autocomplete, mat-autocomplete',
  templateUrl: 'autocomplete.html',
  styleUrls: ['autocomplete.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  exportAs: 'mdAutocomplete',
  host: {
    'class': 'mat-autocomplete'
  }
})
export class MdAutocomplete implements AfterContentInit {

  /** Manages active item in option list based on key events. */
  _keyManager: ActiveDescendantKeyManager<MdOption>;

  /** Whether the autocomplete panel should be visible, depending on option length. */
  showPanel = false;

  /** @docs-private */
  @ViewChild(TemplateRef) template: TemplateRef<any>;

  /** Element for the panel containing the autocomplete options. */
  @ViewChild('panel') panel: ElementRef;

  /** @docs-private */
  @ContentChildren(MdOption, { descendants: true }) options: QueryList<MdOption>;

  /** @docs-private */
  @ContentChildren(MdOptgroup) optionGroups: QueryList<MdOptgroup>;

  /** Function that maps an option's control value to its display value in the trigger. */
  @Input() displayWith: ((value: any) => string) | null = null;

  /** Event that is emitted whenever an option from the list is selected. */
  @Output() optionSelected: EventEmitter<MdAutocompleteSelectedEvent> =
      new EventEmitter<MdAutocompleteSelectedEvent>();

  /** Unique ID to be used by autocomplete trigger's "aria-owns" property. */
  id: string = `md-autocomplete-${_uniqueAutocompleteIdCounter++}`;

  constructor(private _changeDetectorRef: ChangeDetectorRef) { }

  ngAfterContentInit() {
    this._keyManager = new ActiveDescendantKeyManager<MdOption>(this.options).withWrap();
  }

  /**
   * Sets the panel scrollTop. This allows us to manually scroll to display options
   * above or below the fold, as they are not actually being focused when active.
   */
  _setScrollTop(scrollTop: number): void {
    if (this.panel) {
      this.panel.nativeElement.scrollTop = scrollTop;
    }
  }

  /** Returns the panel's scrollTop. */
  _getScrollTop(): number {
    return this.panel ? this.panel.nativeElement.scrollTop : 0;
  }

  /** Panel should hide itself when the option list is empty. */
  _setVisibility(): void {
    Promise.resolve().then(() => {
      this.showPanel = !!this.options.length;
      this._changeDetectorRef.markForCheck();
    });
  }

  /** Emits the `select` event. */
  _emitSelectEvent(option: MdOption): void {
    const event = new MdAutocompleteSelectedEvent(this, option);
    this.optionSelected.emit(event);
  }

  /** Sets a class on the panel based on whether it is visible. */
  _getClassList() {
    return {
      'mat-autocomplete-visible': this.showPanel,
      'mat-autocomplete-hidden': !this.showPanel
    };
  }

}


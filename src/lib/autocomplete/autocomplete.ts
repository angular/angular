/**
 * @license
 * Copyright Google LLC All Rights Reserved.
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
import {MatOption, MatOptgroup} from '@angular/material/core';
import {ActiveDescendantKeyManager} from '@angular/cdk/a11y';


/**
 * Autocomplete IDs need to be unique across components, so this counter exists outside of
 * the component definition.
 */
let _uniqueAutocompleteIdCounter = 0;

/** Event object that is emitted when an autocomplete option is selected */
export class MatAutocompleteSelectedEvent {
  constructor(
    /** Reference to the autocomplete panel that emitted the event. */
    public source: MatAutocomplete,
    /** Option that was selected. */
    public option: MatOption) { }
}


@Component({
  moduleId: module.id,
  selector: 'mat-autocomplete',
  templateUrl: 'autocomplete.html',
  styleUrls: ['autocomplete.css'],
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  exportAs: 'matAutocomplete',
  host: {
    'class': 'mat-autocomplete'
  }
})
export class MatAutocomplete implements AfterContentInit {

  /** Manages active item in option list based on key events. */
  _keyManager: ActiveDescendantKeyManager<MatOption>;

  /** Whether the autocomplete panel should be visible, depending on option length. */
  showPanel = false;

  /** Whether the autocomplete panel is open. */
  get isOpen(): boolean {
    return this._isOpen && this.showPanel;
  }
  _isOpen: boolean = false;

  /** @docs-private */
  @ViewChild(TemplateRef) template: TemplateRef<any>;

  /** Element for the panel containing the autocomplete options. */
  @ViewChild('panel') panel: ElementRef;

  /** @docs-private */
  @ContentChildren(MatOption, { descendants: true }) options: QueryList<MatOption>;

  /** @docs-private */
  @ContentChildren(MatOptgroup) optionGroups: QueryList<MatOptgroup>;

  /** Function that maps an option's control value to its display value in the trigger. */
  @Input() displayWith: ((value: any) => string) | null = null;

  /** Event that is emitted whenever an option from the list is selected. */
  @Output() optionSelected: EventEmitter<MatAutocompleteSelectedEvent> =
      new EventEmitter<MatAutocompleteSelectedEvent>();

  /**
   * Takes classes set on the host mat-autocomplete element and applies them to the panel
   * inside the overlay container to allow for easy styling.
   */
  @Input('class')
  set classList(classList: string) {
    if (classList && classList.length) {
      classList.split(' ').forEach(className => this._classList[className.trim()] = true);
      this._elementRef.nativeElement.className = '';
    }
  }
  _classList: {[key: string]: boolean} = {};

  /** Unique ID to be used by autocomplete trigger's "aria-owns" property. */
  id: string = `mat-autocomplete-${_uniqueAutocompleteIdCounter++}`;

  constructor(private _changeDetectorRef: ChangeDetectorRef, private _elementRef: ElementRef) { }

  ngAfterContentInit() {
    this._keyManager = new ActiveDescendantKeyManager<MatOption>(this.options).withWrap();
    // Set the initial visibiity state.
    this._setVisibility();
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
  _setVisibility() {
    this.showPanel = !!this.options.length;
    this._classList['mat-autocomplete-visible'] = this.showPanel;
    this._classList['mat-autocomplete-hidden'] = !this.showPanel;
    this._changeDetectorRef.markForCheck();
}

  /** Emits the `select` event. */
  _emitSelectEvent(option: MatOption): void {
    const event = new MatAutocompleteSelectedEvent(this, option);
    this.optionSelected.emit(event);
  }
}


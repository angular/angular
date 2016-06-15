import {
    ContentChild,
    Directive,
    Component,
    Input,
    Output,
    ViewChildren,
    NgZone,
    EventEmitter
} from '@angular/core';
import {QueryList} from '@angular/core';
import {ContentChildren} from '@angular/core';
import {PortalHostDirective} from '@angular2-material/core/portal/portal-directives';
import {MdTabLabel} from './tab-label';
import {MdTabContent} from './tab-content';
import {MdTabLabelWrapper} from './tab-label-wrapper';
import {MdInkBar} from './ink-bar';
import {Observable} from 'rxjs/Observable';

/** Used to generate unique ID's for each tab component */
let nextId = 0;

/** A simple change event emitted on focus or selection changes. */
export class MdTabChangeEvent {
  index: number;
  tab: MdTab;
}

@Directive({
  selector: 'md-tab'
})
export class MdTab {
  @ContentChild(MdTabLabel) label: MdTabLabel;
  @ContentChild(MdTabContent) content: MdTabContent;
}

/**
 * Material design tab-group component.  Supports basic tab pairs (label + content) and includes
 * animated ink-bar, keyboard navigation, and screen reader.
 * See: https://www.google.com/design/spec/components/tabs.html
 */
@Component({
  moduleId: module.id,
  selector: 'md-tab-group',
  templateUrl: 'tab-group.html',
  styleUrls: ['tab-group.css'],
  directives: [PortalHostDirective, MdTabLabelWrapper, MdInkBar],
})
export class MdTabGroup {
  /** @internal */
  @ContentChildren(MdTab) tabs: QueryList<MdTab>;

  @ViewChildren(MdTabLabelWrapper) private _labelWrappers: QueryList<MdTabLabelWrapper>;
  @ViewChildren(MdInkBar) private _inkBar: QueryList<MdInkBar>;

  private _isInitialized: boolean = false;

  private _selectedIndex: number = 0;
  @Input()
  set selectedIndex(value: number) {
    this._selectedIndex = value;

    if (this._isInitialized) {
      this._onSelectChange.emit(this._createChangeEvent(value));
    }
  }
  get selectedIndex(): number {
    return this._selectedIndex;
  }

  private _onFocusChange: EventEmitter<MdTabChangeEvent> = new EventEmitter<MdTabChangeEvent>();
  @Output('focusChange') get focusChange(): Observable<MdTabChangeEvent> {
    return this._onFocusChange.asObservable();
  }

  private _onSelectChange: EventEmitter<MdTabChangeEvent> = new EventEmitter<MdTabChangeEvent>();
  @Output('selectChange') get selectChange(): Observable<MdTabChangeEvent> {
    return this._onSelectChange.asObservable();
  }

  private _focusIndex: number = 0;
  private _groupId: number;

  constructor(private _zone: NgZone) {
    this._groupId = nextId++;
  }

  /**
   * Waits one frame for the view to update, then upates the ink bar
   * Note: This must be run outside of the zone or it will create an infinite change detection loop
   * TODO: internal
   */
  ngAfterViewChecked(): void {
    this._zone.runOutsideAngular(() => {
      window.requestAnimationFrame(() => {
        this._updateInkBar();
      });
    });
    this._isInitialized = true;
  }

  /** Tells the ink-bar to align itself to the current label wrapper */
  private _updateInkBar(): void {
    this._inkBar.toArray()[0].alignToElement(this._currentLabelWrapper);
  }

  /**
   * Reference to the current label wrapper; defaults to null for initial render before the
   * ViewChildren references are ready.
   */
  private get _currentLabelWrapper(): HTMLElement {
    return this._labelWrappers && this._labelWrappers.length
        ? this._labelWrappers.toArray()[this.selectedIndex].elementRef.nativeElement
        : null;
  }

  /** Tracks which element has focus; used for keyboard navigation */
  get focusIndex(): number {
    return this._focusIndex;
  }

  /** When the focus index is set, we must manually send focus to the correct label */
  set focusIndex(value: number) {
    this._focusIndex = value;

    if (this._isInitialized) {
      this._onFocusChange.emit(this._createChangeEvent(value));
    }

    if (this._labelWrappers && this._labelWrappers.length) {
      this._labelWrappers.toArray()[value].focus();
    }
  }

  private _createChangeEvent(index: number): MdTabChangeEvent {
    const event = new MdTabChangeEvent;
    event.index = index;
    if (this.tabs && this.tabs.length) {
      event.tab = this.tabs.toArray()[index];
    }
    return event;
  }

  /**
   * Returns a unique id for each tab label element
   * @internal
   */
  getTabLabelId(i: number): string {
    return `md-tab-label-${this._groupId}-${i}`;
  }

  /**
   * Returns a unique id for each tab content element
   * @internal
   */
  getTabContentId(i: number): string {
    return `md-tab-content-${this._groupId}-${i}`;
  }

  /** Increment the focus index by 1; prevent going over the number of tabs */
  focusNextTab(): void {
    if (this._labelWrappers && this.focusIndex < this._labelWrappers.length - 1) {
      this.focusIndex++;
    }
  }

  /** Decrement the focus index by 1; prevent going below 0 */
  focusPreviousTab(): void {
    if (this.focusIndex > 0) {
      this.focusIndex--;
    }
  }
}

export const MD_TABS_DIRECTIVES = [MdTabGroup, MdTabLabel, MdTabContent, MdTab];

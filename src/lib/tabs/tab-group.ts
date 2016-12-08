import {
  NgModule,
  ModuleWithProviders,
  ViewChild,
  Component,
  Input,
  Output,
  EventEmitter,
  QueryList,
  ContentChildren,
  ElementRef,
  Renderer
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {
  PortalModule,
  coerceBooleanProperty
} from '../core';
import {MdTabLabel} from './tab-label';
import {MdTabLabelWrapper} from './tab-label-wrapper';
import {MdTabNavBar, MdTabLink, MdTabLinkRipple} from './tab-nav-bar/tab-nav-bar';
import {MdInkBar} from './ink-bar';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import {MdRippleModule} from '../core/ripple/ripple';
import {MdTab} from './tab';
import {MdTabBody} from './tab-body';
import {ViewportRuler} from '../core/overlay/position/viewport-ruler';
import {MdTabHeader} from './tab-header';


/** Used to generate unique ID's for each tab component */
let nextId = 0;

/** A simple change event emitted on focus or selection changes. */
export class MdTabChangeEvent {
  index: number;
  tab: MdTab;
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
})
export class MdTabGroup {
  @ContentChildren(MdTab) _tabs: QueryList<MdTab>;

  @ViewChild('tabBodyWrapper') _tabBodyWrapper: ElementRef;

  /** Whether this component has been initialized. */
  private _isInitialized: boolean = false;

  /** The tab index that should be selected after the content has been checked. */
  private _indexToSelect = 0;

  /** Snapshot of the height of the tab body wrapper before another tab is activated. */
  private _tabBodyWrapperHeight: number = null;

  /** Whether the tab group should grow to the size of the active tab */
  private _dynamicHeight: boolean = false;
  @Input('md-dynamic-height') set dynamicHeight(value: boolean) {
    this._dynamicHeight = coerceBooleanProperty(value);
  }

  /** The index of the active tab. */
  private _selectedIndex: number = null;
  @Input() set selectedIndex(value: number) {
    this._indexToSelect = value;
  }
  get selectedIndex(): number {
    return this._selectedIndex;
  }

  /** Output to enable support for two-way binding on `selectedIndex`. */
  @Output() get selectedIndexChange(): Observable<number> {
    return this.selectChange.map(event => event.index);
  }

  private _onFocusChange: EventEmitter<MdTabChangeEvent> = new EventEmitter<MdTabChangeEvent>();
  @Output() get focusChange(): Observable<MdTabChangeEvent> {
    return this._onFocusChange.asObservable();
  }

  private _onSelectChange: EventEmitter<MdTabChangeEvent> =
      new EventEmitter<MdTabChangeEvent>(true);
  @Output() get selectChange(): Observable<MdTabChangeEvent> {
    return this._onSelectChange.asObservable();
  }

  private _groupId: number;

  constructor(private _renderer: Renderer) {
    this._groupId = nextId++;
  }

  /**
   * After the content is checked, this component knows what tabs have been defined
   * and what the selected index should be. This is where we can know exactly what position
   * each tab should be in according to the new selected index, and additionally we know how
   * a new selected tab should transition in (from the left or right).
   */
  ngAfterContentChecked(): void {
    // Clamp the next selected index to the bounds of 0 and the tabs length.
    this._indexToSelect =
        Math.min(this._tabs.length - 1, Math.max(this._indexToSelect, 0));

    // If there is a change in selected index, emit a change event. Should not trigger if
    // the selected index has not yet been initialized.
    if (this._selectedIndex != this._indexToSelect && this._selectedIndex != null) {
      this._onSelectChange.emit(this._createChangeEvent(this._indexToSelect));
    }

    // Setup the position for each tab and optionally setup an origin on the next selected tab.
    this._tabs.forEach((tab: MdTab, index: number) => {
      tab.position = index - this._indexToSelect;

      // If there is already a selected tab, then set up an origin for the next selected tab
      // if it doesn't have one already.
      if (this._selectedIndex != null && tab.position == 0 && !tab.origin) {
        tab.origin = this._indexToSelect - this._selectedIndex;
      }
    });

    this._selectedIndex = this._indexToSelect;
  }

  /**
   * Waits one frame for the view to update, then updates the ink bar
   * Note: This must be run outside of the zone or it will create an infinite change detection loop
   * TODO: internal
   */
  ngAfterViewChecked(): void {
    this._isInitialized = true;
  }

  _focusChanged(index: number) {
    this._onFocusChange.emit(this._createChangeEvent(index));
  }

  private _createChangeEvent(index: number): MdTabChangeEvent {
    const event = new MdTabChangeEvent;
    event.index = index;
    if (this._tabs && this._tabs.length) {
      event.tab = this._tabs.toArray()[index];
    }
    return event;
  }

  /** Returns a unique id for each tab label element */
  _getTabLabelId(i: number): string {
    return `md-tab-label-${this._groupId}-${i}`;
  }

  /** Returns a unique id for each tab content element */
  _getTabContentId(i: number): string {
    return `md-tab-content-${this._groupId}-${i}`;
  }

  /**
   * Sets the height of the body wrapper to the height of the activating tab if dynamic
   * height property is true.
   */
  _setTabBodyWrapperHeight(tabHeight: number): void {
    if (!this._dynamicHeight || !this._tabBodyWrapperHeight) { return; }

    this._renderer.setElementStyle(this._tabBodyWrapper.nativeElement, 'height',
        this._tabBodyWrapperHeight + 'px');

    // This conditional forces the browser to paint the height so that
    // the animation to the new height can have an origin.
    if (this._tabBodyWrapper.nativeElement.offsetHeight) {
      this._renderer.setElementStyle(this._tabBodyWrapper.nativeElement, 'height',
          tabHeight + 'px');
    }
  }

  /** Removes the height of the tab body wrapper. */
  _removeTabBodyWrapperHeight(): void {
    this._tabBodyWrapperHeight = this._tabBodyWrapper.nativeElement.clientHeight;
    this._renderer.setElementStyle(this._tabBodyWrapper.nativeElement, 'height', '');
  }
}

@NgModule({
  imports: [CommonModule, PortalModule, MdRippleModule],
  // Don't export all components because some are only to be used internally.
  exports: [MdTabGroup, MdTabLabel, MdTab, MdTabNavBar, MdTabLink, MdTabLinkRipple],
  declarations: [MdTabGroup, MdTabLabel, MdTab, MdInkBar, MdTabLabelWrapper,
    MdTabNavBar, MdTabLink, MdTabBody, MdTabLinkRipple, MdTabHeader],
})
export class MdTabsModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MdTabsModule,
      providers: [ViewportRuler]
    };
  }
}

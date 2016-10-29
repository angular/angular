import {
    NgModule,
    ModuleWithProviders,
    ContentChild,
    ViewChild,
    Component,
    Input,
    Output,
    ViewChildren,
    NgZone,
    EventEmitter,
    QueryList,
    ContentChildren,
    TemplateRef,
    ViewContainerRef,
    OnInit,
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {
    PortalModule,
    TemplatePortal,
    RIGHT_ARROW,
    LEFT_ARROW,
    ENTER,
    coerceBooleanProperty,
} from '../core';
import {MdTabLabel} from './tab-label';
import {MdTabLabelWrapper} from './tab-label-wrapper';
import {MdTabNavBar, MdTabLink} from './tab-nav-bar/tab-nav-bar';
import {MdInkBar} from './ink-bar';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';


/** Used to generate unique ID's for each tab component */
let nextId = 0;

/** A simple change event emitted on focus or selection changes. */
export class MdTabChangeEvent {
  index: number;
  tab: MdTab;
}

@Component({
  moduleId: module.id,
  selector: 'md-tab',
  templateUrl: 'tab.html',
})
export class MdTab implements OnInit {
  /** Content for the tab label given by <template md-tab-label>. */
  @ContentChild(MdTabLabel) templateLabel: MdTabLabel;

  /** Template inside the MdTab view that contains an <ng-content>. */
  @ViewChild(TemplateRef) _content: TemplateRef<any>;

  /** The plain text label for the tab, used when there is no template label. */
  @Input('label') textLabel: string = '';

  private _contentPortal: TemplatePortal = null;

  constructor(private _viewContainerRef: ViewContainerRef) { }

  ngOnInit() {
    this._contentPortal = new TemplatePortal(this._content, this._viewContainerRef);
  }

  private _disabled = false;
  @Input() set disabled(value: boolean) { this._disabled = coerceBooleanProperty(value); }
  get disabled(): boolean { return this._disabled; }

  get content(): TemplatePortal {
    return this._contentPortal;
  }
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

  @ViewChildren(MdTabLabelWrapper) _labelWrappers: QueryList<MdTabLabelWrapper>;
  @ViewChildren(MdInkBar) _inkBar: QueryList<MdInkBar>;

  private _isInitialized: boolean = false;

  private _selectedIndex: number = 0;
  @Input()
  set selectedIndex(value: number) {
    if (value != this._selectedIndex && this.isValidIndex(value)) {
      this._selectedIndex = value;

      if (this._isInitialized) {
        this._onSelectChange.emit(this._createChangeEvent(value));
      }
    }
  }
  get selectedIndex(): number {
    return this._selectedIndex;
  }

  /**
   * Determines if an index is valid.  If the tabs are not ready yet, we assume that the user is
   * providing a valid index and return true.
   */
  isValidIndex(index: number): boolean {
    if (this._tabs) {
      const tab = this._tabs.toArray()[index];
      return tab && !tab.disabled;
    } else {
      return true;
    }
  }

  /** Output to enable support for two-way binding on `selectedIndex`. */
  @Output() get selectedIndexChange(): Observable<number> {
    return this.selectChange.map(event => event.index);
  }

  private _onFocusChange: EventEmitter<MdTabChangeEvent> = new EventEmitter<MdTabChangeEvent>();
  @Output() get focusChange(): Observable<MdTabChangeEvent> {
    return this._onFocusChange.asObservable();
  }

  private _onSelectChange: EventEmitter<MdTabChangeEvent> = new EventEmitter<MdTabChangeEvent>();
  @Output() get selectChange(): Observable<MdTabChangeEvent> {
    return this._onSelectChange.asObservable();
  }

  private _focusIndex: number = 0;
  private _groupId: number;

  constructor(private _zone: NgZone) {
    this._groupId = nextId++;
  }

  /**
   * Waits one frame for the view to update, then updates the ink bar
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
    if (this.isValidIndex(value)) {
      this._focusIndex = value;

      if (this._isInitialized) {
        this._onFocusChange.emit(this._createChangeEvent(value));
      }

      if (this._labelWrappers && this._labelWrappers.length) {
        this._labelWrappers.toArray()[value].focus();
      }
    }
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

  handleKeydown(event: KeyboardEvent) {
    switch (event.keyCode) {
      case RIGHT_ARROW:
        this.focusNextTab();
        break;
      case LEFT_ARROW:
        this.focusPreviousTab();
        break;
      case ENTER:
        this.selectedIndex = this.focusIndex;
        break;
    }
  }

  /**
   * Moves the focus left or right depending on the offset provided.  Valid offsets are 1 and -1.
   */
  moveFocus(offset: number) {
    if (this._labelWrappers) {
      const tabs: MdTab[] = this._tabs.toArray();
      for (let i = this.focusIndex + offset; i < tabs.length && i >= 0; i += offset) {
        if (this.isValidIndex(i)) {
          this.focusIndex = i;
          return;
        }
      }
    }
  }

  /** Increment the focus index by 1 until a valid tab is found. */
  focusNextTab(): void {
    this.moveFocus(1);
  }

  /** Decrement the focus index by 1 until a valid tab is found. */
  focusPreviousTab(): void {
    this.moveFocus(-1);
  }
}


@NgModule({
  imports: [CommonModule, PortalModule],
  // Don't export MdInkBar or MdTabLabelWrapper, as they are internal implementation details.
  exports: [MdTabGroup, MdTabLabel, MdTab, MdTabNavBar, MdTabLink],
  declarations: [MdTabGroup, MdTabLabel, MdTab, MdInkBar, MdTabLabelWrapper,
    MdTabNavBar, MdTabLink],
})
export class MdTabsModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MdTabsModule,
      providers: []
    };
  }
}

import {Component, Input, ViewChildren, NgZone} from '@angular/core';
import {QueryList} from '@angular/core';
import {ContentChildren} from '@angular/core';
import {PortalHostDirective} from '@angular2-material/core/portal/portal-directives';
import {MdTabLabel} from './tab-label';
import {MdTabContent} from './tab-content';
import {MdTabLabelWrapper} from './tab-label-wrapper';
import {MdInkBar} from './ink-bar';

/** Used to generate unique ID's for each tab component */
let nextId = 0;

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
  @ContentChildren(MdTabLabel) labels: QueryList<MdTabLabel>;

  /** @internal */
  @ContentChildren(MdTabContent) contents: QueryList<MdTabContent>;

  @ViewChildren(MdTabLabelWrapper) private _labelWrappers: QueryList<MdTabLabelWrapper>;
  @ViewChildren(MdInkBar) private _inkBar: QueryList<MdInkBar>;

  @Input() selectedIndex: number = 0;

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
    if (this._labelWrappers && this._labelWrappers.length) {
      this._labelWrappers.toArray()[value].focus();
    }
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

export const MD_TABS_DIRECTIVES = [MdTabGroup, MdTabLabel, MdTabContent];

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Inject,
  InjectionToken,
  Input,
  Output,
  QueryList,
  ViewChild,
} from '@angular/core';

import {expanding_row_css} from './expanding_row_css';
import {ExpandingRowSummary} from './expanding_row_summary';
import {ExpandingRowToggleEvent} from './expanding_row_toggle_event';

/**
 * Injection token to break cylic dependency between ExpandingRow and
 * ExpandingRowHost
 */
export const EXPANDING_ROW_HOST_INJECTION_TOKEN = new InjectionToken<ExpandingRowHostBase>(
  'ExpandingRowHost',
);

/** The base class for ExpandingRowHost component to break cylic dependency. */
export interface ExpandingRowHostBase {
  /**
   * A reference to all child cfc-expanding-row elements. We will need for
   * keyboard accessibility and scroll adjustments. For example, we need to know
   * which row is previous row when user presses "left arrow" on a focused row.
   */
  contentRows: QueryList<ExpandingRow>;

  /**
   * Keeps track of the last row that had focus before focus left the list
   * of expanding rows.
   */
  lastFocusedRow?: ExpandingRow;

  /**
   * Handles summary element click on a cfc-expanding-row component. Note
   * that summary element is visible only when the row is collapsed. So this
   * event will fired prior to expansion of a collapsed row. Scroll adjustment
   * below makes sure mouse stays on the caption element when the collapsed
   * row expands.
   */
  handleRowSummaryClick(row: ExpandingRow): void;

  /**
   * Check if element is collapsible.  Elements marked as uncollapsible will not collapse an
   * open row when clicked.
   */
  isCollapsible(element: HTMLElement | null): boolean;

  /**
   * Handles caption element click on a cfc-expanding-row component. Note
   * that caption element is visible only when the row is expanded. So this
   * means we will collapse the expanded row. The scroll adjustment below
   * makes sure that the mouse stays under the summary of the expanded row
   * when the row collapses.
   */
  handleRowCaptionClick(row: ExpandingRow): void;

  /**
   * Handles expansion of a row. When a new row expands, we need to remove
   * previous expansion and collapse. We also need to save the currently
   * expanded row so that we can collapse this row once another row expands.
   */
  handleRowExpand(row: ExpandingRow): void;

  /**
   * Handles focus on a row. When a new row gets focus (note that this is
   * different from expansion), we need to remove previous focus and expansion.
   * We need to save the reference to this focused row so that we can unfocus
   * this row when another row is focused.
   */
  handleRowFocus(row: ExpandingRow): void;

  /**
   * Function that is called by expanding row summary to focus on the last
   * focusable element before the list of expanding rows.
   */
  focusOnPreviousFocusableElement(): void;

  /**
   * Function that is called by expanding row summary to focus on the next
   * focusable element after the list of expanding rows.
   */
  focusOnNextFocusableElement(): void;
}

/**
 * This component is used to render a single expanding row. It should contain
 * cfc-expanding-row-summary, cfc-expanding-row-details-caption and
 * cfc-expanding-row-details-content components.
 */
@Component({
  selector: 'cfc-expanding-row',
  styles: [expanding_row_css],
  template: ` <div
    #expandingRowMainElement
    class="cfc-expanding-row"
    cdkMonitorSubtreeFocus
    [attr.tabindex]="isExpanded ? '0' : '-1'"
    [class.cfc-expanding-row-has-focus]="isFocused"
    [class.cfc-expanding-row-is-expanded]="isExpanded"
    ve="CfcExpandingRow"
  >
    <ng-content></ng-content>
  </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class ExpandingRow {
  /**
   * The identifier for this node provided by the user code. We need this
   * while we are emitting onToggle event.
   */
  @Input() rowId!: string;

  /**
   * An ElementRef to the main element in this component. We need a reference
   * to this element to compute the height. The height of cfc-expanding-row
   * is used in [cfcExpandingRowHost] directive for scroll adjustments.
   */
  @ViewChild('expandingRowMainElement', {static: true}) expandingRowMainElement!: ElementRef;

  /**
   * This @Output event emitter will be triggered when the user expands or
   * collapses this node.
   */
  @Output() onToggle = new EventEmitter<ExpandingRowToggleEvent>();

  /**
   * A boolean indicating if this node is expanded. This value is used to
   * hide/show summary, caption, and content of the expanding row. There should
   * only be one expanded row within [cfcExpandingRowHost] directive. And if
   * there is an expanded row, there shouldn't be any focused rows.
   */
  set isExpanded(value: boolean) {
    const changed: boolean = this.isExpandedInternal !== value;
    this.isExpandedInternal = value;

    if (changed) {
      this.isExpandedChange.emit();
      this.changeDetectorRef.markForCheck();
    }
  }

  /** TS getter for isExpanded property. */
  get isExpanded(): boolean {
    return this.isExpandedInternal;
  }

  /** Triggered when isExpanded property changes. */
  isExpandedChange = new EventEmitter<void>();

  /** Triggered when index property changes. */
  indexChange = new EventEmitter<void>();

  /**
   * A boolean indicating if this node is focused. This value is used to add
   * a CSS class that should render a blue border on the right. There should
   * only be one focused row in [cfcExpandingRowHost] directive.
   */
  set isFocused(value: boolean) {
    this.isFocusedInternal = value;
    this.changeDetectorRef.markForCheck();
  }

  /** TS getter for isFocused property. */
  get isFocused(): boolean {
    return this.isFocusedInternal;
  }

  /** The index of the row in the context of the entire collection. */
  set index(value: number) {
    const changed: boolean = this.indexInternal !== value;
    this.indexInternal = value;

    if (changed) {
      this.indexChange.emit();
      this.changeDetectorRef.markForCheck();
    }
  }

  /** TS getter for index property. */
  get index(): number {
    return this.indexInternal;
  }

  /**
   * We should probably rename this to summaryContentChild. Because technically
   * this is not a @ViewChild that is in a template. This will be transcluded.
   * Note that we are not using @ContentChild directive here. The @ContentChild
   * will cause cyclic reference if the class definition for ExpandingRowSummary
   * component is not in the same file as ExpandingRow.
   */
  // TODO(b/109816955): remove '!', see go/strict-prop-init-fix.
  summaryViewChild!: ExpandingRowSummary;

  /**
   * We compute the collapsed height (which is just height of
   * cfc-expanding-row-summary component) in this component. This is used in
   * [cfcExpandingRowHost] for scroll adjustment calculation.
   */
  collapsedHeight = -1;

  /** Internal storage for isExpanded public property. */
  private isExpandedInternal = false;

  /** Internal storage for isFocused public property. */
  private isFocusedInternal = false;

  /** Internal storage for index public property. */
  // TODO(b/109816955): remove '!', see go/strict-prop-init-fix.
  private indexInternal!: number;

  /**
   * This holds a reference to [cfcExpandingRowHost] directive. We need
   * this reference to notify the host when this row expands/collapses or is
   * focused.
   */
  constructor(
    public elementRef: ElementRef,
    @Inject(EXPANDING_ROW_HOST_INJECTION_TOKEN) public expandingRowHost: ExpandingRowHostBase,
    private readonly changeDetectorRef: ChangeDetectorRef,
  ) {}

  /**
   * Handles click on cfc-expanding-row-summary component. This will expand
   * this row and collapse the previously expanded row. The collapse & blur
   * is handled in [cfcExpandingRowHost] directive.
   */
  handleSummaryClick(): void {
    this.collapsedHeight = this.elementRef.nativeElement.querySelector(
      '.cfc-expanding-row-summary',
    ).offsetHeight;
    this.expandingRowHost.handleRowSummaryClick(this);
    this.expand();
  }

  /**
   * When user tabs into child cfc-expanding-row-summary component. This method
   * will make sure we focuse on this row, and blur on previously focused row.
   */
  handleSummaryFocus(): void {
    this.focus();
  }

  /**
   * cfc-expanding-row-details-caption component will call this function to
   * notify click on its host element. Note that caption is only shown when
   * the row is expanded. Hence this will collapse this row and put the focus
   * on it.
   * If an uncollapsible element exists in the caption, clicking that element will
   * not trigger the row collapse.
   */
  handleCaptionClick(event: MouseEvent): void {
    if (this.expandingRowHost.isCollapsible(event.target as {} as HTMLElement)) {
      this.expandingRowHost.handleRowCaptionClick(this);
      this.collapse();
      this.focus();
    }
  }

  /**
   * Gets the height of this component. This height is used in parent
   * [cfcExpandingRowHost] directive to compute scroll adjustment.
   */
  getHeight(): number {
    return this.expandingRowMainElement.nativeElement.offsetHeight;
  }

  /**
   * Expands this row. This will notify the host so that it can collapse
   * previously expanded row. This function also emits onToggle @Output event
   * to the user code.
   */
  expand(): void {
    this.isExpanded = true;
    this.expandingRowHost.handleRowExpand(this);

    // setTimeout here makes sure we scroll this row into view after animation.
    setTimeout(() => {
      this.expandingRowMainElement.nativeElement.focus();
    });

    this.onToggle.emit({rowId: this.rowId, isExpand: true});
  }

  /**
   * Collapses this row. Setting isExpanded to false will make sure we hide
   * the caption and details, and show cfc-expanding-row-summary component.
   * This also emits onToggle @Output event to the user code.
   */
  collapse(): void {
    this.isExpanded = false;
    this.onToggle.emit({rowId: this.rowId, isExpand: false});
  }

  /**
   * Blurs this row. This should remove the blue border on the left if there
   * is any. This function will remove DOM focus on the
   * cfc-expanding-row-summary
   * component.
   */
  blur(): void {
    this.isFocused = false;
    this.summaryViewChild.blur();
  }

  /**
   * Focuses this row. This should put blue border on the left. If there is
   * any previous focus/selection, those should be gone. Parent
   * [cfcExpandingRowHost] component takes care of that.
   */
  focus(): void {
    this.isFocused = true;
    this.expandingRowHost.handleRowFocus(this);

    // Summary child is not present currently. We need to NG2 to update the
    // template.
    setTimeout(() => {
      this.summaryViewChild.focus();
    });
  }

  /**
   * We listen for TAB press here to make sure we trap the focus on the
   * expanded
   * row. If the row is not expanded, we don't care about this event since focus
   * trap should work for expanded rows only.
   */
  @HostListener('keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    const charCode = event.which || event.keyCode;

    switch (charCode) {
      case 9:
        if (!this.isExpanded) {
          return;
        }

        this.trapFocus(event);
        break;
      default:
        break;
    }
  }

  /**
   * When this row is expanded, this function traps the focus between focusable
   * elements contained in this row.
   */
  private trapFocus(event: KeyboardEvent): void {
    const rowElement: HTMLElement = this.expandingRowMainElement.nativeElement;
    const focusableEls: HTMLElement[] = [];
    let lastFocusableEl: HTMLElement = rowElement;

    if (focusableEls.length) {
      lastFocusableEl = focusableEls[focusableEls.length - 1];
    }

    if (event.target === lastFocusableEl && !event.shiftKey) {
      rowElement.focus();
      event.preventDefault();
    } else if (event.target === rowElement && event.shiftKey) {
      lastFocusableEl.focus();
      event.preventDefault();
    }
  }
}

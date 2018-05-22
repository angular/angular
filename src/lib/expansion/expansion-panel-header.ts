/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {FocusMonitor} from '@angular/cdk/a11y';
import {ENTER, SPACE} from '@angular/cdk/keycodes';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Directive,
  ElementRef,
  Host,
  Input,
  Optional,
  OnDestroy,
  ViewEncapsulation,
} from '@angular/core';
import {merge, Subscription} from 'rxjs';
import {filter} from 'rxjs/operators';
import {matExpansionAnimations} from './expansion-animations';
import {MatExpansionPanel} from './expansion-panel';
import {MatAccordion} from './accordion';


/**
 * `<mat-expansion-panel-header>`
 *
 * This component corresponds to the header element of an `<mat-expansion-panel>`.
 */
@Component({
  moduleId: module.id,
  selector: 'mat-expansion-panel-header',
  styleUrls: ['./expansion-panel-header.css'],
  templateUrl: './expansion-panel-header.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    matExpansionAnimations.indicatorRotate,
    matExpansionAnimations.expansionHeaderHeight
  ],
  host: {
    'class': 'mat-expansion-panel-header',
    'role': 'button',
    '[attr.id]': 'panel._headerId',
    '[attr.tabindex]': 'panel.disabled ? -1 : 0',
    '[attr.aria-controls]': '_getPanelId()',
    '[attr.aria-expanded]': '_isExpanded()',
    '[attr.aria-disabled]': 'panel.disabled',
    '[class.mat-expanded]': '_isExpanded()',
    '(click)': '_toggle()',
    '(keydown)': '_keydown($event)',
    '[@expansionHeight]': `{
        value: _getExpandedState(),
        params: {
          collapsedHeight: collapsedHeight,
          expandedHeight: expandedHeight
        }
    }`,
  },
})
export class MatExpansionPanelHeader implements OnDestroy {
  private _parentChangeSubscription = Subscription.EMPTY;

  constructor(
    @Optional() accordion: MatAccordion,
    @Host() public panel: MatExpansionPanel,
    private _element: ElementRef,
    private _focusMonitor: FocusMonitor,
    private _changeDetectorRef: ChangeDetectorRef) {

    let changeStreams = [panel._inputChanges];
    if (accordion) {
      changeStreams.push(accordion._inputChanges);
    }

    // Since the toggle state depends on an @Input on the panel, we
    // need to subscribe and trigger change detection manually.
    this._parentChangeSubscription = merge(
      panel.opened,
      panel.closed,
      merge(...changeStreams).pipe(
        filter(changes => !!(changes.hideToggle || changes.disabled || changes.togglePosition)))
    )
    .subscribe(() => this._changeDetectorRef.markForCheck());

    _focusMonitor.monitor(_element.nativeElement);
  }

  /** Height of the header while the panel is expanded. */
  @Input() expandedHeight: string;

  /** Height of the header while the panel is collapsed. */
  @Input() collapsedHeight: string;

  /** Toggles the expanded state of the panel. */
  _toggle(): void {
    this.panel.toggle();
  }

  /** Gets whether the panel is expanded. */
  _isExpanded(): boolean {
    return this.panel.expanded;
  }

  /** Gets the expanded state string of the panel. */
  _getExpandedState(): string {
    return this.panel._getExpandedState();
  }

  /** Gets the panel id. */
  _getPanelId(): string {
    return this.panel.id;
  }

  /** Gets whether the expand indicator should be shown. */
  _isToggleVisible(): boolean {
    return !this.panel.hideToggle && !this.panel.disabled;
  }

  /** Whether the expand indicator should be shown before the header content */
  _placeToggleBefore(): boolean {
    return this.panel.togglePosition === 'before';
  }

  /** Handle keydown event calling to toggle() if appropriate. */
  _keydown(event: KeyboardEvent) {
    switch (event.keyCode) {
      // Toggle for space and enter keys.
      case SPACE:
      case ENTER:
        event.preventDefault();
        this._toggle();
        break;
      default:
        return;
    }
  }

  ngOnDestroy() {
    this._parentChangeSubscription.unsubscribe();
    this._focusMonitor.stopMonitoring(this._element.nativeElement);
  }
}

/**
 * `<mat-panel-description>`
 *
 * This directive is to be used inside of the MatExpansionPanelHeader component.
 */
@Directive({
  selector: 'mat-panel-description',
  host : {
    class: 'mat-expansion-panel-header-description'
  }
})
export class MatExpansionPanelDescription {}

/**
 * `<mat-panel-title>`
 *
 * This directive is to be used inside of the MatExpansionPanelHeader component.
 */
@Directive({
  selector: 'mat-panel-title',
  host : {
    class: 'mat-expansion-panel-header-title'
  }
})
export class MatExpansionPanelTitle {}

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  Component,
  Directive,
  Host,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnDestroy,
  Renderer2,
  ElementRef,
} from '@angular/core';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import {SPACE, ENTER} from '../core/keyboard/keycodes';
import {MdExpansionPanel, EXPANSION_PANEL_ANIMATION_TIMING} from './expansion-panel';
import {filter} from '../core/rxjs/index';
import {FocusOriginMonitor} from '../core/style/index';
import {merge} from 'rxjs/observable/merge';
import {Subscription} from 'rxjs/Subscription';


/**
 * <md-expansion-panel-header> component.
 *
 * This component corresponds to the header element of an <md-expansion-panel>.
 *
 * Please refer to README.md for examples on how to use it.
 */
@Component({
  moduleId: module.id,
  selector: 'md-expansion-panel-header, mat-expansion-panel-header',
  styleUrls: ['./expansion-panel-header.css'],
  templateUrl: './expansion-panel-header.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'mat-expansion-panel-header',
    'role': 'button',
    '[attr.tabindex]': 'panel.disabled ? -1 : 0',
    '[attr.aria-controls]': '_getPanelId()',
    '[attr.aria-expanded]': '_isExpanded()',
    '[attr.aria-disabled]': 'panel.disabled',
    '[class.mat-expanded]': '_isExpanded()',
    '(click)': '_toggle()',
    '(keyup)': '_keyup($event)',
    '[@expansionHeight]': '_getExpandedState()',
  },
  animations: [
    trigger('indicatorRotate', [
      state('collapsed', style({transform: 'rotate(0deg)'})),
      state('expanded', style({transform: 'rotate(180deg)'})),
      transition('expanded <=> collapsed', animate(EXPANSION_PANEL_ANIMATION_TIMING)),
    ]),
    trigger('expansionHeight', [
      state('collapsed', style({height: '48px'})),
      state('expanded', style({height: '64px'})),
      transition('expanded <=> collapsed', animate(EXPANSION_PANEL_ANIMATION_TIMING)),
    ]),
  ],
})
export class MdExpansionPanelHeader implements OnDestroy {
  private _parentChangeSubscription: Subscription | null = null;

  constructor(
    @Host() public panel: MdExpansionPanel,
    private _renderer: Renderer2,
    private _element: ElementRef,
    private _focusOriginMonitor: FocusOriginMonitor,
    private _changeDetectorRef: ChangeDetectorRef) {

    // Since the toggle state depends on an @Input on the panel, we
    // need to  subscribe and trigger change detection manually.
    this._parentChangeSubscription = merge(
      panel.opened,
      panel.closed,
      filter.call(panel._inputChanges, changes => !!(changes.hideToggle || changes.disabled))
    )
    .subscribe(() => this._changeDetectorRef.markForCheck());

    _focusOriginMonitor.monitor(_element.nativeElement, _renderer, false);
  }

  /** Toggles the expanded state of the panel. */
  _toggle(): void {
    if (!this.panel.disabled) {
      this.panel.toggle();
    }
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
  _showToggle(): boolean {
    return !this.panel.hideToggle && !this.panel.disabled;
  }

  /** Handle keyup event calling to toggle() if appropriate. */
  _keyup(event: KeyboardEvent) {
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
    if (this._parentChangeSubscription) {
      this._parentChangeSubscription.unsubscribe();
      this._parentChangeSubscription = null;
    }

    this._focusOriginMonitor.stopMonitoring(this._element.nativeElement);
  }
}

/**
 * <md-panel-description> directive.
 *
 * This direction is to be used inside of the MdExpansionPanelHeader component.
 */
@Directive({
  selector: 'md-panel-description, mat-panel-description',
  host : {
    class: 'mat-expansion-panel-header-description'
  }
})
export class MdExpansionPanelDescription {}

/**
 * <md-panel-title> directive.
 *
 * This direction is to be used inside of the MdExpansionPanelHeader component.
 */
@Directive({
  selector: 'md-panel-title, mat-panel-title',
  host : {
    class: 'mat-expansion-panel-header-title'
  }
})
export class MdExpansionPanelTitle {}

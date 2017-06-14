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
  host: {
    'class': 'mat-expansion-panel-header',
    'role': 'button',
    'tabindex': '0',
    '[attr.aria-controls]': '_getPanelId()',
    '[attr.aria-expanded]': '_isExpanded()',
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
      state('collapsed', style({height: '48px', 'line-height': '48px'})),
      state('expanded', style({height: '64px', 'line-height': '68px'})),
      transition('expanded <=> collapsed', animate(EXPANSION_PANEL_ANIMATION_TIMING)),
    ]),
  ],
})
export class MdExpansionPanelHeader {
  constructor(@Host() public panel: MdExpansionPanel) {}

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

  /** Gets whether the expand indicator is hidden. */
  _getHideToggle(): boolean {
    return this.panel.hideToggle;
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

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
  Input,
  ViewEncapsulation,
  Optional,
  forwardRef,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  SimpleChanges,
  OnChanges,
  OnDestroy,
} from '@angular/core';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import {MdAccordion} from './accordion';
import {AccordionItem} from './accordion-item';
import {UniqueSelectionDispatcher} from '../core';
import {mixinDisabled, CanDisable} from '../core/common-behaviors/disabled';
import {Subject} from 'rxjs/Subject';

// Boilerplate for applying mixins to MdExpansionPanel.
/** @docs-private */
export class MdExpansionPanelBase extends AccordionItem {
  constructor(accordion: MdAccordion,
              _changeDetectorRef: ChangeDetectorRef,
              _uniqueSelectionDispatcher: UniqueSelectionDispatcher) {
    super(accordion, _changeDetectorRef, _uniqueSelectionDispatcher);
  }
}
export const _MdExpansionPanelMixinBase = mixinDisabled(MdExpansionPanelBase);

/** MdExpansionPanel's states. */
export type MdExpansionPanelState = 'expanded' | 'collapsed';

/** Time and timing curve for expansion panel animations. */
export const EXPANSION_PANEL_ANIMATION_TIMING = '225ms cubic-bezier(0.4,0.0,0.2,1)';

/**
 * <md-expansion-panel> component.
 *
 * This component can be used as a single element to show expandable content, or as one of
 * multiple children of an element with the CdkAccordion directive attached.
 *
 * Please refer to README.md for examples on how to use it.
 */
@Component({
  moduleId: module.id,
  styleUrls: ['./expansion-panel.css'],
  selector: 'md-expansion-panel, mat-expansion-panel',
  templateUrl: './expansion-panel.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  inputs: ['disabled', 'expanded'],
  host: {
    'class': 'mat-expansion-panel',
    '[class.mat-expanded]': 'expanded',
    '[class.mat-expansion-panel-spacing]': '_hasSpacing()',
  },
  providers: [
    {provide: AccordionItem, useExisting: forwardRef(() => MdExpansionPanel)}
  ],
  animations: [
    trigger('bodyExpansion', [
      state('collapsed', style({height: '0px', visibility: 'hidden'})),
      state('expanded', style({height: '*', visibility: 'visible'})),
      transition('expanded <=> collapsed', animate(EXPANSION_PANEL_ANIMATION_TIMING)),
    ]),
  ],
})
export class MdExpansionPanel extends _MdExpansionPanelMixinBase
    implements CanDisable, OnChanges, OnDestroy {
  /** Whether the toggle indicator should be hidden. */
  @Input() hideToggle: boolean = false;

  /** Stream that emits for changes in `@Input` properties. */
  _inputChanges = new Subject<SimpleChanges>();

  constructor(@Optional() @Host() accordion: MdAccordion,
              _changeDetectorRef: ChangeDetectorRef,
              _uniqueSelectionDispatcher: UniqueSelectionDispatcher) {
    super(accordion, _changeDetectorRef, _uniqueSelectionDispatcher);
    this.accordion = accordion;
  }

  /** Whether the expansion indicator should be hidden. */
  _getHideToggle(): boolean {
    if (this.accordion) {
      return this.accordion.hideToggle;
    }
    return this.hideToggle;
  }

  /** Determines whether the expansion panel should have spacing between it and its siblings. */
  _hasSpacing(): boolean {
    if (this.accordion) {
      return (this.expanded ? this.accordion.displayMode : this._getExpandedState()) === 'default';
    }
    return false;
  }

  /** Gets the expanded state string. */
  _getExpandedState(): MdExpansionPanelState {
    return this.expanded ? 'expanded' : 'collapsed';
  }

  ngOnChanges(changes: SimpleChanges) {
    this._inputChanges.next(changes);
  }

  ngOnDestroy() {
    this._inputChanges.complete();
  }
}

@Directive({
  selector: 'mat-action-row, md-action-row',
  host: {
    class: 'mat-action-row'
  }
})
export class MdExpansionPanelActionRow {}

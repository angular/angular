/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {animate, state, style, transition, trigger} from '@angular/animations';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Directive,
  forwardRef,
  Host,
  Input,
  OnChanges,
  OnDestroy,
  Optional,
  SimpleChanges,
  ViewEncapsulation,
  ViewContainerRef,
  AfterContentInit,
  ContentChild,
} from '@angular/core';
import {CdkAccordionItem} from '@angular/cdk/accordion';
import {UniqueSelectionDispatcher} from '@angular/cdk/collections';
import {CanDisable, mixinDisabled} from '@angular/material/core';
import {TemplatePortal} from '@angular/cdk/portal';
import {Subject} from 'rxjs/Subject';
import {take} from 'rxjs/operators/take';
import {filter} from 'rxjs/operators/filter';
import {startWith} from 'rxjs/operators/startWith';
import {MatAccordion} from './accordion';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {MatExpansionPanelContent} from './expansion-panel-content';

/** Time and timing curve for expansion panel animations. */
export const EXPANSION_PANEL_ANIMATION_TIMING = '225ms cubic-bezier(0.4,0.0,0.2,1)';

// Boilerplate for applying mixins to MatExpansionPanel.
/** @docs-private */
@Component({
  template: '',
  moduleId: module.id,
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatExpansionPanelBase extends CdkAccordionItem {
  constructor(accordion: MatAccordion,
              _changeDetectorRef: ChangeDetectorRef,
              _uniqueSelectionDispatcher: UniqueSelectionDispatcher) {
    super(accordion, _changeDetectorRef, _uniqueSelectionDispatcher);
  }
}
export const _MatExpansionPanelMixinBase = mixinDisabled(MatExpansionPanelBase);

/** MatExpansionPanel's states. */
export type MatExpansionPanelState = 'expanded' | 'collapsed';

/**
 * <mat-expansion-panel> component.
 *
 * This component can be used as a single element to show expandable content, or as one of
 * multiple children of an element with the MatAccordion directive attached.
 *
 * Please refer to README.md for examples on how to use it.
 */
@Component({
  moduleId: module.id,
  styleUrls: ['./expansion-panel.css'],
  selector: 'mat-expansion-panel',
  exportAs: 'matExpansionPanel',
  templateUrl: './expansion-panel.html',
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  inputs: ['disabled', 'expanded'],
  outputs: ['opened', 'closed'],
  host: {
    'class': 'mat-expansion-panel',
    '[class.mat-expanded]': 'expanded',
    '[class.mat-expansion-panel-spacing]': '_hasSpacing()',
  },
  providers: [
    {provide: _MatExpansionPanelMixinBase, useExisting: forwardRef(() => MatExpansionPanel)}
  ],
  animations: [
    trigger('bodyExpansion', [
      state('collapsed', style({height: '0px', visibility: 'hidden'})),
      state('expanded', style({height: '*', visibility: 'visible'})),
      transition('expanded <=> collapsed', animate(EXPANSION_PANEL_ANIMATION_TIMING)),
    ]),
  ],
})
export class MatExpansionPanel extends _MatExpansionPanelMixinBase
    implements CanDisable, AfterContentInit, OnChanges, OnDestroy {

  /** Whether the toggle indicator should be hidden. */
  @Input()
  get hideToggle(): boolean {
    return this._hideToggle;
  }
  set hideToggle(value: boolean) {
    this._hideToggle = coerceBooleanProperty(value);
  }
  private _hideToggle = false;

  /** Stream that emits for changes in `@Input` properties. */
  _inputChanges = new Subject<SimpleChanges>();

  /** Optionally defined accordion the expansion panel belongs to. */
  accordion: MatAccordion;

  /** Content that will be rendered lazily. */
  @ContentChild(MatExpansionPanelContent) _lazyContent: MatExpansionPanelContent;

  /** Portal holding the user's content. */
  _portal: TemplatePortal<any>;

  constructor(@Optional() @Host() accordion: MatAccordion,
              _changeDetectorRef: ChangeDetectorRef,
              _uniqueSelectionDispatcher: UniqueSelectionDispatcher,
              private _viewContainerRef: ViewContainerRef) {
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
  _getExpandedState(): MatExpansionPanelState {
    return this.expanded ? 'expanded' : 'collapsed';
  }

  ngAfterContentInit() {
    if (this._lazyContent) {
      // Render the content as soon as the panel becomes open.
      this.opened.pipe(
        startWith(null!),
        filter(() => this.expanded && !this._portal),
        take(1)
      ).subscribe(() => {
        this._portal = new TemplatePortal<any>(this._lazyContent._template, this._viewContainerRef);
      });
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    this._inputChanges.next(changes);
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this._inputChanges.complete();
  }
}

@Directive({
  selector: 'mat-action-row',
  host: {
    class: 'mat-action-row'
  }
})
export class MatExpansionPanelActionRow {}

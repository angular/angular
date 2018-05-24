/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AnimationEvent} from '@angular/animations';
import {CdkAccordionItem} from '@angular/cdk/accordion';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {UniqueSelectionDispatcher} from '@angular/cdk/collections';
import {TemplatePortal} from '@angular/cdk/portal';
import {
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  Directive,
  Input,
  OnChanges,
  OnDestroy,
  Optional,
  SimpleChanges,
  SkipSelf,
  ViewContainerRef,
  ViewEncapsulation,
} from '@angular/core';
import {Subject} from 'rxjs';
import {filter, startWith, take} from 'rxjs/operators';
import {MatAccordion} from './accordion';
import {matExpansionAnimations} from './expansion-animations';
import {MatExpansionPanelContent} from './expansion-panel-content';


/** MatExpansionPanel's states. */
export type MatExpansionPanelState = 'expanded' | 'collapsed';

/** Counter for generating unique element ids. */
let uniqueId = 0;

/**
 * `<mat-expansion-panel>`
 *
 * This component can be used as a single element to show expandable content, or as one of
 * multiple children of an element with the MatAccordion directive attached.
 */
@Component({
  moduleId: module.id,
  styleUrls: ['./expansion-panel.css'],
  selector: 'mat-expansion-panel',
  exportAs: 'matExpansionPanel',
  templateUrl: './expansion-panel.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  inputs: ['disabled', 'expanded'],
  outputs: ['opened', 'closed', 'expandedChange'],
  animations: [matExpansionAnimations.bodyExpansion],
  providers: [
    // Provide MatAccordion as undefined to prevent nested expansion panels from registering
    // to the same accordion.
    {provide: MatAccordion, useValue: undefined},
  ],
  host: {
    'class': 'mat-expansion-panel',
    '[class.mat-expanded]': 'expanded',
    '[class.mat-expansion-panel-spacing]': '_hasSpacing()',
  }
})
export class MatExpansionPanel extends CdkAccordionItem
    implements AfterContentInit, OnChanges, OnDestroy {
  /** Whether the toggle indicator should be hidden. */
  @Input()
  get hideToggle(): boolean { return this._hideToggle; }
  set hideToggle(value: boolean) {
    this._hideToggle = coerceBooleanProperty(value);
  }
  private _hideToggle = false;

  /** Stream that emits for changes in `@Input` properties. */
  readonly _inputChanges = new Subject<SimpleChanges>();

  /** Optionally defined accordion the expansion panel belongs to. */
  accordion: MatAccordion;

  /** Content that will be rendered lazily. */
  @ContentChild(MatExpansionPanelContent) _lazyContent: MatExpansionPanelContent;

  /** Portal holding the user's content. */
  _portal: TemplatePortal;

  /** ID for the associated header element. Used for a11y labelling. */
  _headerId = `mat-expansion-panel-header-${uniqueId++}`;

  constructor(@Optional() @SkipSelf() accordion: MatAccordion,
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
        this._portal = new TemplatePortal(this._lazyContent._template, this._viewContainerRef);
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

  _bodyAnimation(event: AnimationEvent) {
    const classList = event.element.classList;
    const cssClass = 'mat-expanded';
    const {phaseName, toState} = event;

    // Toggle the body's `overflow: hidden` class when closing starts or when expansion ends in
    // order to prevent the cases where switching too early would cause the animation to jump.
    // Note that we do it directly on the DOM element to avoid the slight delay that comes
    // with doing it via change detection.
    if (phaseName === 'done' && toState === 'expanded') {
      classList.add(cssClass);
    } else if (phaseName === 'start' && toState === 'collapsed') {
      classList.remove(cssClass);
    }
  }
}

@Directive({
  selector: 'mat-action-row',
  host: {
    class: 'mat-action-row'
  }
})
export class MatExpansionPanelActionRow {}
